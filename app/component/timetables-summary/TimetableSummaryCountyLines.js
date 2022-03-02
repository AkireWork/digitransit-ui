import PropTypes from 'prop-types';
/* eslint-disable react/no-array-index-key */
import React, { Component } from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import moment from 'moment';
import connectToStores from 'fluxible-addons-react/connectToStores';
import DepartureTime from '../DepartureTime';
import RouteNumberContainer from '../RouteNumberContainer';
import { isCallAgencyDeparture } from '../../util/legUtils';
import RouteDestination from '../RouteDestination';
import FilterTimeTableModal from '../FilterTimeTableModal';
import TimeTableOptionsPanel from '../TimeTableOptionsPanel';
import {Link, locationShape, routerShape} from "react-router";
import {PREFIX_ROUTES, PREFIX_STOPS} from "../../util/path";
import SecondaryButton from "../SecondaryButton";
import getContext from "recompose/getContext";

class TimetableSummaryCountyLines extends Component {
  static contextTypes = {
    location: locationShape.isRequired,
    router: routerShape.isRequired,
  };

  static propTypes = {
    stop: PropTypes.any.isRequired,
    patterns: PropTypes.any.isRequired,
    breakpoint: PropTypes.any.isRequired,
    currentTime: PropTypes.any.isRequired,
    intl: PropTypes.any,
  };

  constructor(props) {
    super(props);
    const trips = [];
    props.patterns.forEach(pattern => {
      const lastStop = pattern.stops.slice(-1).pop();
      const isLastStop = props.stop.gtfsId === lastStop.gtfsId;
      if (isLastStop) {
        return;
      }

      pattern.patternTimetable.forEach(timetable => {
        const validFrom = moment(timetable.validity.validFrom, 'DD.MM.YYYY');
        const validTill = moment(timetable.validity.validTill, 'DD.MM.YYYY');
        const currentTime = moment.unix(props.currentTime).startOf('day');

        const isValidTillInTheFuture = validTill.isSameOrAfter(currentTime);
        const isValidFromInsideTwoWeeksFromNow = validFrom.isSameOrBefore(
          moment(currentTime).add(14, 'days'),
        );
        const isValidFromInTheFuture = validFrom.isAfter(currentTime);
        if (isValidTillInTheFuture && isValidFromInsideTwoWeeksFromNow) {
          trips.push({
            id: timetable.trip.id,
            gtfsId: timetable.trip.gtfsId,
            code: pattern.code,
            route: pattern.route,
            tripName: timetable.trip.tripLongName,
            headsign: pattern.trip.headsign,
            weekdays: timetable.weekdays,
            validFrom: isValidFromInTheFuture && timetable.validity.validFrom,
            time: timetable.times[0].scheduledDeparture,
            pickupType: timetable.times[0].pickupType,
          });
        }
      });
    });

    this.state = {
      showFilterModal: false,
      showRoutes: [],
      trips: trips.sort((a, b) => a.time - b.time),
      showMoreStatus: {},
    };
  }

  setShowMoreStatus(trip, newStatus) {
    const newShowMoreStatus = { ...this.state.showMoreStatus };
    newShowMoreStatus[trip.id] = newStatus;

    this.setState({
      showMoreStatus: newShowMoreStatus,
    });
  }

  renderRouteDesc(trip) {
    const { showMoreStatus } = this.state;
    const allRouteDescLines = trip.route.desc.split('<br>');
    const tripShowMoreStatus = showMoreStatus[trip.id];

    let routeDescLines = allRouteDescLines;
    if (!tripShowMoreStatus) {
      routeDescLines = routeDescLines.slice(0, 3);
    }

    return (
      <div className="route-desc">
        {routeDescLines.map((line, index) => (
          <p key={index}>{line}</p>
        ))}
        {!tripShowMoreStatus && allRouteDescLines.length > 3 && (
          <a
            className="show-more-less"
            onClick={() => this.setShowMoreStatus(trip, true)}
          >
            <FormattedMessage id="show-more" defaultMessage="Show more" />
          </a>
        )}
        {tripShowMoreStatus && (
          <a
            className="show-more-less"
            onClick={() => this.setShowMoreStatus(trip, false)}
          >
            <FormattedMessage id="show-less" defaultMessage="Show less" />
          </a>
        )}
      </div>
    );
  }

  showModal = val => {
    this.setState({ showFilterModal: val });
  };

  prepareStopForFilter() {
    const { patterns } = this.props;

    return {
      stoptimesForServiceDate: patterns.map(pattern => ({
        pattern,
        stoptimes: [{
          pickupType: 'SCHEDULED',
        },],
      })),
    };
  }

  setRouteVisibilityState = val => {
    this.setState({ showRoutes: val.showRoutes });
  };

  printItinerary = e => {
    e.stopPropagation();

    window.print();
  };

  render() {
    const { trips, showFilterModal, showRoutes } = this.state;
    const { currentTime, intl } = this.props;
    const stopForFilter = this.prepareStopForFilter();
    return (
      <>
        {showFilterModal === true ? (
          <FilterTimeTableModal
            stop={stopForFilter}
            setRoutes={this.setRouteVisibilityState}
            showFilterModal={this.showModal}
            showRoutesList={showRoutes}
          />
        ) : null}
        <div className="row">
          <div className="columns medium-11">
            <TimeTableOptionsPanel
              showRoutes={showRoutes}
              showFilterModal={this.showModal}
              stop={stopForFilter}
            />
          </div>
          <div className="columns medium-1 padding-vertical-small">
            <div className="print-button-container">
              <SecondaryButton
                ariaLabel="print"
                buttonName="print"
                buttonClickAction={e => this.printItinerary(e)}
                buttonIcon="icon-icon_print"
                smallSize
              />
            </div>
          </div>
        </div>
        <div className="departure-list-header row padding-vertical-small">
          <span className="time-header">
            <FormattedMessage id="leaves" defaultMessage="Leaves" />
          </span>
          <span className="route-number-header">
            <FormattedMessage id="route" defaultMessage="Route" />
          </span>
          <span className="route-destination-header">
            <FormattedMessage id="direction" defaultMessage="Destination" />
          </span>
        </div>
        <div className="stop-scroll-container departure-list">
          {trips
            .filter(
              trip =>
                showRoutes.length === 0 ||
                showRoutes.filter(v => v === trip.code).length > 0,
            )
            .map(trip => (
              <div
                className="departure route-detail-text padding-normal border-bottom"
                key={`${trip.id}-${trip.time}-${trip.weekdays}`}
              >
                <div className="time">
                  <DepartureTime
                    departureTime={trip.time}
                    currentTime={currentTime}
                    useUTC
                  />
                  <div className="weekdays-group">{trip.weekdays}</div>
                </div>
                <RouteNumberContainer
                  route={trip.route}
                  isCallAgency={isCallAgencyDeparture(trip)}
                  fadeLong
                />
                <div className="route-destination-with-desc">
                  <Link to={`/${PREFIX_ROUTES}/${trip.route.gtfsId}/${PREFIX_STOPS}/${trip.code}/${trip.gtfsId}?stopId=${this.props.stop.gtfsId}`}>
                    <RouteDestination
                      mode={trip.route.mode}
                      destination={`${trip.tripName ||
                      trip.route.longName ||
                      trip.headsign} ${
                        trip.validFrom
                          ? intl.formatMessage(
                          {
                            id: 'valid-from',
                            defaultMessage: '(alates {validFrom})',
                          },
                          { validFrom: trip.validFrom },
                          )
                          : ''
                        }`}
                    />
                  </Link>
                  {trip.pickupType === 'NONE' && (
                    <span className="drop-off-container">
                      <span className="drop-off-stop-icon bus" />
                      <FormattedMessage
                        id="route-destination-arrives"
                        defaultMessage="Drop-off only"
                      />
                    </span>
                  )}
                  {trip.route.desc && this.renderRouteDesc(trip)}
                </div>
              </div>
            ))}
        </div>
      </>
    );
  }
}

const connectedComponent = connectToStores(
  injectIntl(TimetableSummaryCountyLines),
  ['TimeStore'],
  context => ({
    currentTime: context
      .getStore('TimeStore')
      .getCurrentTime()
      .unix(),
  }),
);

export {
  connectedComponent as default,
  TimetableSummaryCountyLines as Component,
};
