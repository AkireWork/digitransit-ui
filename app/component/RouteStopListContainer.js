import PropTypes from 'prop-types';
import React from 'react';
import Relay from 'react-relay/classic';
import connectToStores from 'fluxible-addons-react/connectToStores';
import groupBy from 'lodash/groupBy';
import values from 'lodash/values';
import cx from 'classnames';

import { StopAlertsQuery } from '../util/alertQueries';
import { getDistanceToNearestStop } from '../util/geo-utils';
import RouteStop from './RouteStop';
import withBreakpoint from '../util/withBreakpoint';

class RouteStopListContainer extends React.PureComponent {
  static propTypes = {
    pattern: PropTypes.object.isRequired,
    className: PropTypes.string,
    vehicles: PropTypes.object,
    position: PropTypes.object.isRequired,
    currentTime: PropTypes.object.isRequired,
    relay: PropTypes.shape({
      setVariables: PropTypes.func.isRequired,
    }).isRequired,
    breakpoint: PropTypes.string.isRequired,
  };

  static contextTypes = {
    config: PropTypes.object.isRequired,
  };

  componentDidMount() {
    if (this.nearestStop) {
      this.nearestStop.element.scrollIntoView(false);
    }
  }

  componentWillReceiveProps({ relay, currentTime }) {
    const currUnix = this.props.currentTime.unix();
    const nextUnix = currentTime.unix();
    if (currUnix !== nextUnix) {
      relay.setVariables({ currentTime: nextUnix });
    }
  }

  setNearestStop = element => {
    this.nearestStop = element;
  };

  getSafeStop = (stop, roundtripStop) => {
    const safe = Object.assign({}, stop);
    stop.stopTimesForPattern.sort(
      (x, y) => x.scheduledDeparture - y.scheduledDeparture,
    );
    roundtripStop[stop.code] = roundtripStop.hasOwnProperty(stop.code)
      ? roundtripStop[stop.code] + 1
      : 0;
    safe.stopTimesForPattern = [
      stop.stopTimesForPattern[roundtripStop[stop.code]],
    ];
    if (stop.stopTimesForPattern.length === 4) {
      roundtripStop[stop.code] = roundtripStop[stop.code] + 1;
      safe.stopTimesForPattern.push(
        stop.stopTimesForPattern[roundtripStop[stop.code]],
      );
    }
    return safe;
  };

  sliceStoptimes = stop => {
    const slicedStop = Object.assign({}, stop);
    slicedStop.stopTimesForPattern = stop.stopTimesForPattern.slice(0, 2);
    return slicedStop;
  };

  getStops() {
    const { position } = this.props;
    const { stops } = this.props.pattern;
    const nearest =
      position.hasLocation === true
        ? getDistanceToNearestStop(position.lat, position.lon, stops)
        : null;
    const mode = this.props.pattern.route.mode.toLowerCase();

    const vehicles = groupBy(
      values(this.props.vehicles)
        .filter(
          vehicle =>
            this.props.currentTime - vehicle.timestamp * 1000 < 5 * 60 * 1000,
        )
        .filter(
          vehicle =>
            vehicle.tripStartTime && vehicle.tripStartTime !== 'undefined',
        ),
      vehicle => vehicle.direction,
    );

    const vehicleStops = groupBy(
      vehicles[this.props.pattern.directionId],
      vehicle => `HSL:${vehicle.next_stop}`,
    );

    const rowClassName = `bp-${this.props.breakpoint}`;
    const roundtripStop = {};

    return stops.map((stop, i, array) => {
      const isNearest =
        (nearest &&
          nearest.distance <
            this.context.config.nearestStopDistance.maxShownDistance &&
          nearest.stop.gtfsId) === stop.gtfsId;
      console.log(
        stop.name,
        stop.stopTimesForPattern.length > 1 &&
          array.filter(item => item.code === stop.code).length > 1,
      );
      const safeStop =
        stop.stopTimesForPattern.length > 1 &&
        array.filter(item => item.code === stop.code).length > 1
          ? this.getSafeStop(stop, roundtripStop)
          : this.sliceStoptimes(stop);

      return (
        <RouteStop
          color={
            this.props.pattern.route && this.props.pattern.route.color
              ? `#${this.props.pattern.route.color}`
              : null
          }
          key={`${stop.gtfsId}-${this.props.pattern}-${Math.random()}`}
          stop={safeStop}
          mode={mode}
          vehicle={
            vehicleStops[stop.gtfsId] ? vehicleStops[stop.gtfsId][0] : null
          }
          distance={isNearest ? nearest.distance : null}
          ref={isNearest ? this.setNearestStop : null}
          currentTime={this.props.currentTime.unix()}
          last={i === stops.length - 1}
          first={i === 0}
          className={rowClassName}
        />
      );
    });
  }

  render() {
    return (
      <div
        className={cx('route-stop-list momentum-scroll', this.props.className)}
      >
        {this.getStops()}
      </div>
    );
  }
}

export default Relay.createContainer(
  connectToStores(
    withBreakpoint(RouteStopListContainer),
    ['RealTimeInformationStore', 'PositionStore', 'TimeStore'],
    ({ getStore }) => ({
      vehicles: getStore('RealTimeInformationStore').vehicles,
      position: getStore('PositionStore').getLocationState(),
      currentTime: getStore('TimeStore').getCurrentTime(),
    }),
  ),
  {
    initialVariables: {
      patternId: null,
      currentTime: 0,
    },
    fragments: {
      pattern: () => Relay.QL`
        fragment on Pattern {
          directionId
          route {
            mode
            color
          }
          stops {
            ${StopAlertsQuery}
            stopTimesForPattern(id: $patternId, startTime: $currentTime, numberOfDepartures: 4) {
              realtime
              realtimeState
              realtimeDeparture
              serviceDay
              scheduledDeparture
              pickupType
            }
            gtfsId
            lat
            lon
            name
            desc
            code
          }
        }
      `,
    },
  },
);
