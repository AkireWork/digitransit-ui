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

  findStopTimeBetween = (stop, previous, next) => {
    let result;
    if (previous !== undefined) {
      stop.stopTimesForPattern.forEach(value => {
        if (
          result === undefined &&
          value.scheduledDeparture - previous.scheduledDeparture >= 0
        ) {
          result = value;
        } else if (
          value.scheduledDeparture - previous.scheduledDeparture >= 0 &&
          value.scheduledDeparture - previous.scheduledDeparture <
            result.scheduledDeparture - previous.scheduledDeparture
        ) {
          result = value;
        }
      });
    } else if (next !== undefined) {
      stop.stopTimesForPattern.forEach(value => {
        if (
          result === undefined &&
          next.scheduledDeparture - value.scheduledDeparture >= 0
        ) {
          result = value;
        } else if (
          next.scheduledDeparture - value.scheduledDeparture >= 0 &&
          next.scheduledDeparture - value.scheduledDeparture <
            next.scheduledDeparture - result.scheduledDeparture
        ) {
          result = value;
        }
      });
    }
    return result;
  };

  getSafeStop = (stop, previousStop, nextStop) => {
    const safe = Object.assign({}, stop);
    safe.stopTimesForPattern = [
      this.findStopTimeBetween(
        stop,
        previousStop ? previousStop.stopTimesForPattern[0] : undefined,
        nextStop ? nextStop.stopTimesForPattern[0] : undefined,
      ),
    ];
    if (stop.stopTimesForPattern.length === 4) {
      safe.stopTimesForPattern.push(
        this.findStopTimeBetween(
          stop,
          previousStop ? previousStop.stopTimesForPattern[1] : undefined,
          nextStop ? nextStop.stopTimesForPattern[1] : undefined,
        ),
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

    return stops.map((stop, i, array) => {
      const isNearest =
        (nearest &&
          nearest.distance <
            this.context.config.nearestStopDistance.maxShownDistance &&
          nearest.stop.gtfsId) === stop.gtfsId;
      const safeStop =
        stop.stopTimesForPattern.length > 1 &&
        array.filter(item => item.code === stop.code).length > 1
          ? this.getSafeStop(
              stop,
              i > 0 ? this.sliceStoptimes(array[i - 1]) : undefined,
              i < array.length - 1
                ? this.sliceStoptimes(array[i + 1])
                : undefined,
            )
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
