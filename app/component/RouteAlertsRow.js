import cx from 'classnames';
import capitalize from 'lodash/capitalize';
import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';

import ComponentUsageExample from './ComponentUsageExample';
import ExternalLink from './ExternalLink';
import IconWithBigCaution from './IconWithBigCaution';
import RouteNumber from './RouteNumber';
import ServiceAlertIcon from './ServiceAlertIcon';
import { AlertSeverityLevelType } from '../constants';

export const getTimePeriod = ({ currentTime, startTime, endTime, intl }) => {
  const at = intl.formatMessage({
    id: 'at-time',
  });
  const defaultFormat = `D.M.YYYY [${at}] HH:mm`;
  return `${capitalize(
    startTime.calendar(currentTime, {
      lastDay: `[${intl.formatMessage({ id: 'yesterday' })} ${at}] HH:mm`,
      sameDay: `[${intl.formatMessage({ id: 'today' })} ${at}] HH:mm`,
      nextDay: `[${intl.formatMessage({ id: 'tomorrow' })} ${at}] HH:mm`,
      lastWeek: defaultFormat,
      nextWeek: defaultFormat,
      sameElse: defaultFormat,
    }),
  )} - ${endTime.calendar(startTime, {
    sameDay: 'HH:mm',
    nextDay: defaultFormat,
    nextWeek: defaultFormat,
    sameElse: defaultFormat,
  })}`;
};

export default function RouteAlertsRow(
  {
    color,
    currentTime,
    description,
    endTime,
    entityIdentifier,
    entityMode,
    entityType,
    expired,
    header,
    severityLevel,
    startTime,
    url,
  },
  { intl },
) {
  const showTime =
    severityLevel &&
    severityLevel !== AlertSeverityLevelType.Info &&
    startTime &&
    endTime &&
    currentTime;
  return (
    <div className={cx('route-alert-row', { expired })}>
      {(entityType === 'route' &&
        entityMode && (
          <RouteNumber
            alertSeverityLevel={severityLevel}
            color={color}
            mode={entityMode}
            vertical
          />
        )) ||
        (entityType === 'stop' && (
          <div className="route-number">
            <IconWithBigCaution
              alertSeverityLevel={severityLevel}
              img="icon-icon_bus-stop"
            />
          </div>
        )) || (
          <div className="route-number">
            <ServiceAlertIcon severityLevel={severityLevel} />
          </div>
        )}
      <div className="route-alert-contents">
        {(entityIdentifier || url) && (
          <div className="route-alert-top-row">
            {entityIdentifier && (
              <div className={entityMode}>{entityIdentifier}</div>
            )}
            {url && (
              <ExternalLink className="route-alert-url" href={url}>
                {intl.formatMessage({ id: 'extra-info' })}
              </ExternalLink>
            )}
          </div>
        )}
        {showTime && (
          <div className="route-alert-time-period">
            {getTimePeriod({
              currentTime: moment.unix(currentTime),
              startTime: moment.unix(startTime),
              endTime: moment.unix(endTime),
              intl,
            })}
          </div>
        )}
        {header && <div className="route-alert-header">{header}</div>}
        {description && <div className="route-alert-body">{description}</div>}
      </div>
    </div>
  );
}

RouteAlertsRow.propTypes = {
  color: PropTypes.string,
  currentTime: PropTypes.number,
  description: PropTypes.string,
  endTime: PropTypes.number,
  entityIdentifier: PropTypes.string,
  entityMode: PropTypes.string,
  entityType: PropTypes.oneOf(['route', 'stop']),
  expired: PropTypes.bool,
  header: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  severityLevel: PropTypes.string,
  startTime: PropTypes.number,
  url: PropTypes.string,
};

RouteAlertsRow.contextTypes = {
  intl: intlShape.isRequired,
};

RouteAlertsRow.defaultProps = {
  currentTime: moment().unix(),
  endTime: undefined,
  expired: false,
  entityIdentifier: undefined,
  entityMode: undefined,
  entityType: 'route',
  severityLevel: undefined,
  startTime: undefined,
};

RouteAlertsRow.description = () => (
  <div>
    <p>Display a disruption alert for a specific route.</p>
    <div className="route-alerts-list">
      <ComponentUsageExample description="Currently active disruption">
        <RouteAlertsRow
          header="Raitiolinja 2 - Myöhästyy"
          description={
            'Raitiolinjat: 2 Kaivopuiston suuntaan ja 3 Nordenskiöldinkadun ' +
            'suuntaan, myöhästyy. Syy: tekninen vika. Paikka: Kauppatori, Hakaniemi. ' +
            'Arvioitu kesto: 14:29 - 15:20.'
          }
          entityMode="tram"
          entityIdentifier="2"
          expired={false}
        />
      </ComponentUsageExample>
      <ComponentUsageExample description="Past disruption">
        <RouteAlertsRow
          header="Raitiolinja 2 - Myöhästyy"
          description={
            'Raitiolinjat: 2 Kaivopuiston suuntaan ja 3 Nordenskiöldinkadun ' +
            'suuntaan, myöhästyy. Syy: tekninen vika. Paikka: Kauppatori, Hakaniemi. ' +
            'Arvioitu kesto: 14:29 - 15:20.'
          }
          entityMode="tram"
          entityIdentifier="2"
          expired
        />
      </ComponentUsageExample>
      <ComponentUsageExample description="service alert, valid yesterday">
        <RouteAlertsRow
          currentTime={moment().unix()}
          startTime={moment()
            .add(-1, 'days')
            .startOf('day')
            .unix()}
          endTime={moment()
            .add(-1, 'days')
            .endOf('day')
            .unix()}
          header="Lähijunat välillä Pasila-Leppävaara peruttu"
          description="Suurin osa lähijunista välillä Pasila-Leppävaara on peruttu asetinlaitevian vuoksi"
          entityIdentifier="Y, S, U, L, E, A"
          entityMode="rail"
          severityLevel="WARNING"
          expired
        />
      </ComponentUsageExample>
      <ComponentUsageExample description="service alert, valid today">
        <RouteAlertsRow
          currentTime={moment().unix()}
          startTime={moment()
            .startOf('day')
            .unix()}
          endTime={moment()
            .endOf('day')
            .unix()}
          header="Lähijunat välillä Pasila-Leppävaara peruttu"
          description="Suurin osa lähijunista välillä Pasila-Leppävaara on peruttu asetinlaitevian vuoksi"
          entityIdentifier="Y, S, U, L, E, A"
          entityMode="rail"
          severityLevel="WARNING"
        />
      </ComponentUsageExample>
      <ComponentUsageExample description="service alert, valid tomorrow">
        <RouteAlertsRow
          currentTime={moment().unix()}
          startTime={moment()
            .add(1, 'day')
            .startOf('day')
            .unix()}
          endTime={moment()
            .add(1, 'day')
            .endOf('day')
            .unix()}
          header="Lähijunat välillä Pasila-Leppävaara peruttu"
          description="Suurin osa lähijunista välillä Pasila-Leppävaara on peruttu asetinlaitevian vuoksi"
          entityIdentifier="Y, S, U, L, E, A"
          entityMode="rail"
          severityLevel="WARNING"
        />
      </ComponentUsageExample>
      <ComponentUsageExample description="service alert, valid some day">
        <RouteAlertsRow
          currentTime={moment().unix()}
          startTime={moment()
            .add(20, 'days')
            .startOf('day')
            .add(8, 'hours')
            .add(37, 'minutes')
            .unix()}
          endTime={moment()
            .add(25, 'days')
            .endOf('day')
            .unix()}
          header="Lähijunat välillä Pasila-Leppävaara peruttu"
          description="Suurin osa lähijunista välillä Pasila-Leppävaara on peruttu asetinlaitevian vuoksi"
          entityIdentifier="Y, S, U, L, E, A"
          entityMode="rail"
          severityLevel="WARNING"
        />
      </ComponentUsageExample>
      <ComponentUsageExample description="with alert url">
        <RouteAlertsRow
          header="Pysäkki H4461 siirtyy"
          description="Leikkikujan pysäkki H4461 siirtyy tilapäisesti kulkusuunnassa 100 metriä taaksepäin."
          entityIdentifier="97N"
          entityMode="bus"
          severityLevel="INFO"
          url="https://www.hsl.fi"
        />
      </ComponentUsageExample>
      <ComponentUsageExample description="service alert for a stop">
        <RouteAlertsRow
          header="Pysäkki H4461 siirtyy"
          description="Leikkikujan pysäkki H4461 siirtyy tilapäisesti kulkusuunnassa 100 metriä taaksepäin."
          entityIdentifier="4461"
          entityMode="bus"
          entityType="stop"
          severityLevel="INFO"
          url="https://www.hsl.fi"
        />
      </ComponentUsageExample>
    </div>
  </div>
);
