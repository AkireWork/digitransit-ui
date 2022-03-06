import PropTypes from 'prop-types';
import React from 'react';
import Relay from 'react-relay/classic';
import connectToStores from 'fluxible-addons-react/connectToStores';
import groupBy from 'lodash/groupBy';
import values from 'lodash/values';
import cx from 'classnames';

import moment from 'moment';
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

  nextTripDate = undefined;

  static contextTypes = {
    config: PropTypes.object.isRequired,
  };

  componentDidMount() {
    if (
      this.props.pattern.stops.filter(
        stop => stop.stopTimesForPattern.length !== 0,
      ).length === 0
    ) {
      const thisDate = this.props.currentTime.format('YYYYMMDD');
      this.props.pattern.trips[0].activeDates.forEach(date => {
        if (
          this.nextTripDate === undefined &&
          date.localeCompare(thisDate) > 0
        ) {
          this.nextTripDate = date;
        } else if (
          date.localeCompare(thisDate) > 0 &&
          date.localeCompare(this.nextTripDate) < 0
        ) {
          this.nextTripDate = date;
        }
      });
    }
    const nextUnix = this.props.currentTime.unix();
    const queryUnix =
      this.nextTripDate !== undefined
        ? moment(this.nextTripDate, 'YYYYMMDD').unix()
        : nextUnix;
    this.props.relay.setVariables({
      currentTime: nextUnix,
      queryTime: queryUnix,
    });
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

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    return (
      nextProps.pattern.stops.filter(
        stop => stop.stopTimesForPattern.length !== 0,
      ).length !== 0
    );
  }

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
    let lastStop;

    const stopCodes = stops.map(stop => stop.code);
    const repeatStops = stopCodes.filter(
      stopCode => stops.filter(s => s.code === stopCode).length > 1,
    );

    return stops.map((stop, i, array) => {
      const isNearest =
        (nearest &&
          nearest.distance <
            this.context.config.nearestStopDistance.maxShownDistance &&
          nearest.stop.gtfsId) === stop.gtfsId;
      const safeStop = this.getSafeStop(
        stop,
        i < array.length - 1 && i === 0 ? array[i + 1] : undefined,
        lastStop,
        repeatStops,
      );
      lastStop = safeStop;

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
          otherDay={
            safeStop.stopTimesForPattern.length > 0 &&
            this.props.currentTime.unix() <
              safeStop.stopTimesForPattern[0].serviceDay
          }
          last={i === stops.length - 1}
          className={rowClassName}
        />
      );
    });
  }

  setNearestStop = element => {
    this.nearestStop = element;
  };

  getSafeStop = (stop, nextStop, lastSafeStop, repeatStops) => {
    const safe = Object.assign({}, stop);
    safe.stopTimesForPattern = [];
    const stopPatterns = stop.stopTimesForPattern;
    let patternIndex = 0;

    while (
      patternIndex < stopPatterns.length &&
      safe.stopTimesForPattern.length < 2
    ) {
      const correctPattern = this.findStopTimeBetween(
        patternIndex,
        stop,
        lastSafeStop
          ? lastSafeStop.stopTimesForPattern[safe.stopTimesForPattern.length]
          : undefined,
        nextStop ? nextStop.stopTimesForPattern : undefined,
      );
      if (correctPattern !== undefined) {
        safe.stopTimesForPattern.push(correctPattern);
        if (repeatStops.includes(safe.code)) {
          patternIndex += 1;
        }
      }
      patternIndex += 1;
    }

    return safe;
  };

  findStopTimeBetween = (patternIndex, thisPattern, previous, nextPatterns) => {
    const stopTime = thisPattern.stopTimesForPattern[patternIndex];
    let result;
    if (previous !== undefined) {
      if (
        // after previous scheduled departure
        result === undefined &&
        stopTime.scheduledDeparture - previous.scheduledDeparture >= 0 &&
        stopTime.scheduledDeparture - previous.scheduledDeparture < 43200
      ) {
        result = stopTime;
      } else if (
        stopTime.scheduledDeparture - previous.scheduledDeparture >= 0 && // after previous scheduled departure
        stopTime.scheduledDeparture - previous.scheduledDeparture < 43200 &&
        stopTime.scheduledDeparture - previous.scheduledDeparture < // closer to previous scheduled departure than previous pattern
          result.scheduledDeparture - previous.scheduledDeparture
      ) {
        result = stopTime;
      }
    } else if (nextPatterns !== undefined) {
      for (let i = 0; i < nextPatterns.length; i++) {
        if (i - patternIndex > 1) {
          break;
        } else if ( //in case of a first stop is repeat stop and first stoptime of first stop is actually endtime of previous pattern that has already departed from first stop.
          patternIndex === 0 &&
          result === undefined &&
          thisPattern.stopTimesForPattern.length > 1 &&
          thisPattern.stopTimesForPattern[1].scheduledDeparture -
            thisPattern.stopTimesForPattern[0].scheduledDeparture >=
            0 &&
          nextPatterns[i].scheduledDeparture -
            thisPattern.stopTimesForPattern[1].scheduledDeparture >=
            0
        ) {
          break;
        } else if (
          // before next scheduled departure
          result === undefined &&
          nextPatterns[i].scheduledDeparture - stopTime.scheduledDeparture >= 0
        ) {
          result = stopTime;
        } else if (
          nextPatterns[i].scheduledDeparture - stopTime.scheduledDeparture >=
            0 && // before next scheduled departure
          nextPatterns[i].scheduledDeparture - stopTime.scheduledDeparture < // and closer to it thant previous pattern
            nextPatterns[i].scheduledDeparture - result.scheduledDeparture
        ) {
          result = stopTime;
        }
      }
    }
    return result;
  };

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
      queryTime: getStore('TimeStore').getCurrentTime(),
    }),
  ),
  {
    initialVariables: {
      patternId: null,
      currentTime: 0,
      queryTime: 0,
    },
    fragments: {
      pattern: () => Relay.QL`
        fragment on Pattern {
          directionId
          route {
            mode
            color
          }
          trips {
            activeDates
          }
          stops {
            ${StopAlertsQuery}
            stopTimesForPattern(id: $patternId, startTime: $queryTime, numberOfDepartures: 6) {
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
