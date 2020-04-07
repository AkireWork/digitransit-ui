import React from 'react';
import { FormattedMessage } from 'react-intl';
import uniqWith from 'lodash/uniqWith';
import isEqual from 'lodash/isEqual';
import memoize from 'lodash/memoize';
import escapeRegExp from 'lodash/escapeRegExp';
import cloneDeep from 'lodash/cloneDeep';

import StopCode from '../component/StopCode';

const getLocality = suggestion =>
  suggestion.localadmin || suggestion.locality || '';

memoize.Cache = Map;

export const getStopCode = ({ id, code }) => {
  if (code) {
    return code;
  }
  if (
    id === undefined ||
    typeof id.indexOf === 'undefined' ||
    id.indexOf('#') === -1
  ) {
    return undefined;
  }
  // id from pelias
  return id.substring(id.indexOf('#') + 1);
};

export const getGTFSId = ({ id, gtfsId }) => {
  if (gtfsId) {
    return gtfsId;
  }

  if (id && typeof id.indexOf === 'function' && id.indexOf('GTFS:') === 0) {
    if (id.indexOf('#') === -1) {
      return id.substring(5);
    }
    return id.substring(5, id.indexOf('#'));
  }

  return undefined;
};

export const isStop = ({ layer }) =>
  layer === 'stop' || layer === 'favouriteStop';

export const isTerminal = ({ layer }) =>
  layer === 'station' || layer === 'favouriteStation';

export function extractStopFromName(suggestion) {
  return suggestion.name.replace(/ [\d-]+$/, '');
}

export function extractStopCodeFromName(suggestion) {
  return suggestion.name.match(/[\d-]+$/)[0];
}

export function getAddressLabel(suggestion) {
  let label = '';
  if (suggestion) {
    label = [
      suggestion.neighbourhood,
      suggestion.locality,
      suggestion.region,
    ]
      .filter(x => !!x)
      .join(', ');
  }
  return label.replace(/,\s*$/, '').replace(/^, /, '');
}

export function getStopLabel(suggestion) {
  let label = '';
  if (suggestion) {
    label = [
      extractStopCodeFromName(),
      suggestion.neighbourhood,
      suggestion.locality,
      suggestion.region,
    ]
      .filter(x => !!x)
      .join(', ');
  }
  return label.replace(/,\s*$/, '').replace(/^, /, '');
}

export const getNameLabel = memoize(
  (suggestion, plain = false) => {
    switch (suggestion.layer) {
      case 'currentPosition':
        return [suggestion.labelId, suggestion.address];
      case 'favouritePlace':
        return [suggestion.locationName, suggestion.address];
      case 'favouriteRoute':
      case 'route-BUS':
      case 'route-TRAM':
      case 'route-RAIL':
      case 'route-SUBWAY':
      case 'route-FERRY':
      case 'route-AIRPLANE':
        return !plain && suggestion.shortName
          ? [
              <span key={suggestion.gtfsId}>
                <span className={suggestion.mode.toLowerCase()}>
                  {suggestion.shortName}
                </span>
                <span className="suggestion-type">
                  &nbsp;-&nbsp;
                  <FormattedMessage id="route" defaultMessage="Route" />
                  &nbsp;({suggestion.region || suggestion.competentAuthority})
                </span>
              </span>,
              suggestion.longName,
            ]
          : [
              suggestion.shortName,
              suggestion.longName,
              suggestion.agency ? suggestion.agency.name : undefined,
            ];
      case 'venue':
      case 'address':
        return [suggestion.name, getAddressLabel(suggestion)];
      case 'favouriteStation':
      case 'favouriteStop':
        return plain
          ? [suggestion.locationName]
          : [
              suggestion.locationName,
              <span key={suggestion.id}>{suggestion.address}</span>,
            ];
      case 'stop':
        return plain
          ? [
              extractStopFromName(suggestion) || suggestion.label,
              getLocality(suggestion),
            ]
          : [
              extractStopFromName(suggestion),
              <span key={suggestion.id}>{getStopLabel(suggestion)}</span>,
            ];
      case 'station':
      default:
        return [suggestion.name, getAddressLabel(suggestion)];
    }
  },
  (item, plain) => {
    const i = cloneDeep(item);
    i.plain = plain;
    return i;
  },
);

export function uniqByLabel(features) {
  return uniqWith(
    features,
    (feat1, feat2) =>
      isEqual(getNameLabel(feat1.properties), getNameLabel(feat2.properties)) &&
      feat1.properties.layer === feat2.properties.layer,
  );
}

export function getLabel(properties) {
  const parts = getNameLabel(properties, true);

  switch (properties.layer) {
    case 'currentPosition':
      return parts[1] || parts[0];
    case 'favouritePlace':
      return parts[0];
    default:
      return parts.length > 1 && parts[1] !== ''
        ? parts.join(', ')
        : parts[1] || parts[0];
  }
}

export function suggestionToLocation(item) {
  const name = getLabel(item.properties);

  return {
    address: name,
    type: item.type,
    id: getGTFSId(item.properties),
    code: getStopCode(item.properties),
    layer: item.properties.layer,
    lat:
      item.lat ||
      (item.geometry &&
        item.geometry.coordinates &&
        item.geometry.coordinates[1]),
    lon:
      item.lon ||
      (item.geometry &&
        item.geometry.coordinates &&
        item.geometry.coordinates[0]),
  };
}

export function getIcon(layer) {
  const layerIcon = new Map([
    ['currentPosition', 'icon-icon_locate'],
    ['favouritePlace', 'icon-icon_star'],
    ['favouriteRoute', 'icon-icon_star'],
    ['favouriteStop', 'icon-icon_star'],
    ['favouriteStation', 'icon-icon_star'],
    ['favourite', 'icon-icon_star'],
    ['address', 'icon-icon_place'],
    ['stop', 'icon-icon_bus-stop'],
    ['locality', 'icon-icon_city'],
    ['station', 'icon-icon_station'],
    ['localadmin', 'icon-icon_city'],
    ['venue', 'icon-icon_city'],
    ['neighbourhood', 'icon-icon_city'],
    ['route-BUS', 'icon-icon_bus-withoutBox'],
    ['route-TRAM', 'icon-icon_tram-withoutBox'],
    ['route-RAIL', 'icon-icon_rail-withoutBox'],
    ['route-SUBWAY', 'icon-icon_subway-withoutBox'],
    ['route-FERRY', 'icon-icon_ferry-withoutBox'],
    ['route-AIRPLANE', 'icon-icon_airplane-withoutBox'],
  ]);

  const defaultIcon = 'icon-icon_place';
  return layerIcon.get(layer) || defaultIcon;
}
