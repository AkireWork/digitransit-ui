import React from 'react';
import moment from 'moment';

const DROPOFF_TYPE_ENTER_ONLY = 'NONE';
const PICKUP_TYPE_LEAVE_ONLY = 'NONE';
const formatTime = timestamp => moment(timestamp * 1000).format('HH:mm');

export default function TimetableWeekViewContent({ stoptimes }) {
  return stoptimes?.map(stoptime => (
    <table
      /* eslint-disable-next-line dot-notation */
      key={stoptime['__dataID__']}
      style={{
        borderCollapse: 'separate',
        borderSpacing: '2rem 0',
        marginBottom: '2rem',
      }}
    >
      <tbody>
        <tr>
          <td />
          <td style={{ color: 'gray' }}>{stoptime.weekdays}</td>
        </tr>
        {stoptime.tripTimesByStops?.map(tripTime => (
          /* eslint-disable-next-line dot-notation */
          <tr key={tripTime['__dataID__']}>
            <td>{tripTime.stopName}</td>
            <td>
              <pre style={{ margin: '0' }}>
                {tripTime.tripTimeShortList?.map(time => (
                  <span
                    /* eslint-disable-next-line dot-notation */
                    key={time['__dataID__']}
                    style={{ marginRight: '1rem' }}
                  >
                    {formatTime(time.scheduledDeparture)}

                    {time.dropoffType === DROPOFF_TYPE_ENTER_ONLY ? (
                      <span>**</span>
                    ) : tripTime.pickupType === PICKUP_TYPE_LEAVE_ONLY ? (
                      <span>*</span>
                    ) : (
                      ''
                    )}
                  </span>
                ))}
              </pre>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  ));
}
