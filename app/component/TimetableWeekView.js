import PropTypes from 'prop-types';
import React from 'react';
import Relay from 'react-relay/classic';
import { locationShape, routerShape } from 'react-router';
import connectToStores from 'fluxible-addons-react/connectToStores';
import TimetableWeekViewHeader from './TimetableWeekViewHeader';
import TimetableWeekViewContent from './TimetableWeekViewContent';

function TimetableWeekView({ trip }) {
  return (
    <div className="momentum-scroll timetable-week-view-container">
      <TimetableWeekViewHeader
        route={trip.trip.route}
        tripLongName={trip.trip.tripLongName}
      />

      <TimetableWeekViewContent stoptimes={trip.trip.stoptimesForWeek} />

      <div style={{ flex: '100%', color: 'gray', marginTop: '40px' }}>
        <span>* ainult väljumiseks</span>
      </div>
      <div style={{ flex: '100%', color: 'gray' }}>
        <span>** ainult sisenemiseks</span>
      </div>
    </div>
  );
}

TimetableWeekView.propTypes = {
  trip: PropTypes.shape({
    stoptimes: PropTypes.array,
  }).isRequired,
};
TimetableWeekView.contextTypes = {
  router: routerShape.isRequired, // eslint-disable-line react/no-typos
  location: locationShape.isRequired, // eslint-disable-line react/no-typos
  config: PropTypes.object.isRequired,
};

export default Relay.createContainer(
  connectToStores(TimetableWeekView, ['TimeStore'], context => ({
    currentTime: context.getStore('TimeStore').getCurrentTime(),
  })),
  {
    fragments: {
      trip: () => Relay.QL`
      fragment trip on QueryType {
        trip(id: $tripId) {
          pattern {
            id
            route {
              id
            }
          }
          tripHeadsign
          tripLongName
          activeDates
          stoptimesForWeek {
            weekdays
            tripTimesByStops {
                stopName
                tripTimeShortList {
                    headsign
                    realtimeState
                    scheduledArrival
                    scheduledDeparture
                    serviceDay
                    pickupType
                    dropoffType
                }
            }
          }
          route {
            color
            shortName
            longName
            competentAuthority
            agency {
              name
            }
          }
        }
      }
    `,
    },
    initialVariables: {
      tripId: '',
    },
  },
);
