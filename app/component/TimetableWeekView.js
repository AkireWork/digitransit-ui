import PropTypes from 'prop-types';
import React from 'react';
import Relay from 'react-relay/classic';
import { locationShape, routerShape } from 'react-router';
import connectToStores from 'fluxible-addons-react/connectToStores';
import moment from 'moment';
import groupBy from 'lodash/groupBy';
import { DATE_FORMAT } from '../constants';

const dayName = { 1: 'E', 2: 'T', 3: 'K', 4: 'N', 5: 'R', 6: 'L', 7: 'P' };

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

  const group = groupBy(
    [...trip.trip.monday, ...trip.trip.tuesday],
    'scheduledDeparture',
  );

  const filterRouteStoptimes = stoptimes =>
    stoptimes.filter(st => st.pattern.route.id === trip.trip.pattern.route.id);

  const mapRouteStoptimes = stoptimesForPattern => {
    return stoptimesForPattern
      .map(pattern =>
        pattern.stoptimes.map(stoptime => ({
          ...stoptime,
          serviceDay: dayName[new Date(stoptime.serviceDay * 1000).getDay()],
          stopName: stoptime.stop.name,
        })),
      )
      .flat();
  };

  const formatTime = timestamp => moment(timestamp * 1000).format('HH:mm');

  const filteredStoptimes = () => {
    const filtered = trip.trip.stops
      .map(stop =>
        filterRouteStoptimes(stop.monday)
          .concat(filterRouteStoptimes(stop.tuesday))
          .concat(filterRouteStoptimes(stop.wednesday))
          .concat(filterRouteStoptimes(stop.thursday))
          .concat(filterRouteStoptimes(stop.friday))
          .concat(filterRouteStoptimes(stop.saturday))
          .concat(filterRouteStoptimes(stop.sunday)),
      )
      .flat();
    return mapRouteStoptimes(filtered);
  };

  const stoptimesByDeparture = stoptimes => {
    return stoptimes.reduce(function(map, obj) {
      map[obj.key] += obj.val;
    });
    return groupBy(stoptimes, 'scheduledDeparture');
  };

  const stoptimesByDaysAndDeparture = stoptimesMap => {
    let map = {};
    Object.keys(stoptimesMap).forEach(function(key) {
      const value = stoptimesMap[key];
      const dayGroup = departureDayGroup(
        value.map(val => val.serviceDay).join(','),
      );
      map = { ...map, departureDayGroup: dayGroup, ...value };
      // stoptimesMap[newKey] = value;
      // delete stoptimesMap[key];
    });
    return groupBy(map, 'dayGroup');
  };

  const uniqueStoptimes = stoptimes => {
    const uniq = [];
    const flags = [];
    const l = stoptimes.length;
    let i;
    for (i = 0; i < l; i++) {
      if (flags[stoptimes[i].scheduledDeparture]) {
        continue;
      }
      flags[stoptimes[i].scheduledDeparture] = true;
      uniq.push(stoptimes[i]);
    }
    return uniq;
  };

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
            flexFlow: 'row wrap',
          }}
        >
          <div className="null" style={{ flex: '50%' }} />
          <div className="head" style={{ flex: '50%' }}>
            {departureDayGroup(trip.trip.stoptimesForWeek[0].weekdays)}
          </div>
          <div style={{ borderBottom: '1px solid black', flex: '100%' }} />
          {uniqueStoptimes(trip.trip.stoptimesForWeek[0].stoptimes).map(
            (t, i1) => (
              <React.Fragment key={`line+${i1}`}>
                <div style={{ flex: '50%' }} className="name">
                  {t.stop.name}
                  <span>
                    {t.dropoffType === dropoffTypeEnterOnly
                      ? '**'
                      : t.pickupType === pickupTypeLeaveOnly
                        ? '*'
                        : ''}
                  </span>
                </div>
                <div style={{ flex: '50%' }} className="bodyy">
                  {formatTime(t.serviceDay + t.scheduledDeparture)}
                </div>
              </React.Fragment>
            ),
          )}
        </div>
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
            weekdays
            stoptimes {
              headsign
              realtimeState
              scheduledArrival
              scheduledDeparture
              serviceDay
              pickupType
              dropoffType
              stop {
                name
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
