import PropTypes from 'prop-types';
import React from 'react';
import Relay from 'react-relay/classic';
import { locationShape, routerShape } from 'react-router';
import connectToStores from 'fluxible-addons-react/connectToStores';
import moment from 'moment';
import { DATE_FORMAT } from '../constants';

const dayNames = ['E', 'T', 'K', 'N', 'R', 'L', 'P'];

const dropoffTypeEnterOnly = 'NONE';
const pickupTypeLeaveOnly = 'NONE';

const departureDayGroup = departureDays => {
  switch (departureDays) {
    case 'E,T,K':
      return 'E-K';
    case 'E,T,K,N':
      return 'E-N';
    case 'E,T,K,N,R':
      return 'E-R';
    case 'E,T,K,N,R,L':
      return 'E-L';
    case 'E,T,K,N,R,L,P':
      return 'E-P';
    case 'T,K,N':
      return 'T-N';
    case 'T,K,N,R':
      return 'T-R';
    default:
      return departureDays;
  }
};

function TimetableWeekView(props) {
  const { trip } = props;

  if (!trip || !trip.trip || trip.trip.length <= 0) {
    return null;
  }
  const getDayNames = stoptimes => {
    const uniqueDayNames = [];
    stoptimes.forEach(stoptime => {
      stoptime.tripTimesByDays.forEach(tripTimeByDay => {
        if (!uniqueDayNames.includes(tripTimeByDay.dayName)) {
          uniqueDayNames.push(tripTimeByDay.dayName);
        }
      });
    });
    return dayNames.filter(dayName => uniqueDayNames.includes(dayName));
  };
  const colWidth =
    1 / (getDayNames(trip.trip.stoptimesForWeek).length + 1) * 100;

  const formatTime = timestamp => moment(timestamp * 1000).format('HH:mm');

  return (
    <div className="momentum-scroll">
      <div
        style={{
          marginLeft: '40px',
          marginRight: '40px',
          display: 'flex',
          flexFlow: 'row wrap',
        }}
      >
        <div>
          <div style={{ display: 'flex', marginBottom: '20px' }}>
            <span style={{ margin: '20px', fontSize: '30px' }}>
              {trip.trip.route.shortName}
            </span>
            <div style={{ display: 'grid', fontSize: '11px' }}>
              <span style={{ fontSize: '20px' }}>
                {trip.trip.route.longName}
              </span>
              <span>Vedaja: {trip.trip.route.agency.name}</span>
              <span>Korraldaja: {trip.trip.route.competentAuthority}</span>
              <span>Maakonnaliin (avalik)</span>
            </div>
          </div>
          <span>{trip.trip.tripLongName}</span>
        </div>
        <div style={{ borderBottom: '1px solid black', flex: '100%' }} />
        <div
          style={{
            display: 'flex',
            flex: '100%',
            flexFlow: 'row wrap',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <div className="null" style={{ flex: `${colWidth}%` }} />
          {getDayNames(trip.trip.stoptimesForWeek).map(dN => (
            <div className="head" style={{ flex: `${colWidth}%` }}>
              <span>{dN}</span>
            </div>
          ))}

          <div style={{ borderBottom: '1px solid black', flex: '100%' }} />
        </div>
        {trip.trip.stoptimesForWeek.map((stopTimesByStopName, i1) => (
          <div
            style={{
              display: 'flex',
              flex: '100%',
              flexFlow: 'row wrap',
              textAlign: 'center',
              borderBottom: '1px solid black',
              borderWidth: 'thin',
            }}
            key={`line+${i1}`}
          >
            <div style={{ flex: `${colWidth}%` }} className="name">
              {stopTimesByStopName.stopName}
            </div>
            {/* t.tripTimesByDays.map */}
            {getDayNames(trip.trip.stoptimesForWeek).map(dN => (
              <div
                key={dN}
                style={{
                  flex: `${colWidth}%`,
                  overflowWrap: 'break-word',
                  borderLeft: '1px solid lightgray',
                }}
                className="bodyy"
              >
                {stopTimesByStopName.tripTimesByDays.find(
                  t => t.dayName === dN,
                ) &&
                  stopTimesByStopName.tripTimesByDays
                    .find(t => t.dayName === dN)
                    .tripTimeShortList.map((tripTime, i) => (
                      <React.Fragment>
                        {formatTime(
                          tripTime.serviceDay + tripTime.scheduledDeparture,
                        )}
                        {tripTime.dropoffType === dropoffTypeEnterOnly ? (
                          <span>**</span>
                        ) : tripTime.pickupType === pickupTypeLeaveOnly ? (
                          <span>*</span>
                        ) : (
                          ''
                        )}
                        {i !==
                        stopTimesByStopName.tripTimesByDays.find(
                          t => t.dayName === dN,
                        ).tripTimeShortList.length -
                          1
                          ? ', '
                          : ''}
                      </React.Fragment>
                    ))}
              </div>
            ))}
          </div>
        ))}
        <div style={{ flex: '100%', color: 'gray', marginTop: '40px' }}>
          <span>* ainult väljumiseks</span>
        </div>
        <div style={{ flex: '100%', color: 'gray' }}>
          <span>** ainult sisenemiseks</span>
        </div>
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
      fragment on QueryType {
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
            stopName
            tripTimesByDays {
              dayName
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
      monday: moment()
        .startOf('W')
        .format(DATE_FORMAT),
      tuesday: moment()
        .startOf('W')
        .add(1, 'days')
        .format(DATE_FORMAT),
      wednesday: moment()
        .startOf('W')
        .add(2, 'days')
        .format(DATE_FORMAT),
      thursday: moment()
        .startOf('W')
        .add(3, 'days')
        .format(DATE_FORMAT),
      friday: moment()
        .startOf('W')
        .add(4, 'days')
        .format(DATE_FORMAT),
      saturday: moment()
        .startOf('W')
        .add(5, 'days')
        .format(DATE_FORMAT),
      sunday: moment()
        .startOf('W')
        .add(6, 'days')
        .format(DATE_FORMAT),
      week: 60 * 60 * 24 * 7,
    },
  },
);
