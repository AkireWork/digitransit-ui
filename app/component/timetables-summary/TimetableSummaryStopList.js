import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

const PRINTOUT_MAX_STOPS = 40;

const TimetableSummaryStopList = ({ currentStop, stops, route }, { config }) => {
  const mode = route.mode;
  const routeColor = route ? `#${route.color}` : null;
  const inactiveColor = 'lightgray';

  const stopData = [];
  let isStopReached = false;
  let currentStopIndex = -1;

  stops.forEach((stop, index) => {
    if (currentStop.gtfsId === stop.gtfsId) {
      isStopReached = true;
      currentStopIndex = index;
    }

    const color = isStopReached ? routeColor : inactiveColor;
    stopData.push({
      color,
      stopName: stop.name,
    });
  });

  const stopsToBeHidden = stops.length - PRINTOUT_MAX_STOPS;
  if (stops.length > PRINTOUT_MAX_STOPS) {
    if (currentStopIndex > stops.length / 2) {
      for (let i = 1; i < stopsToBeHidden; i++) {
        stopData[i].className = 'timetable-summary-stop-printout-hidden';
      }

      stopData.splice(1, 0, {
        color: inactiveColor,
        stopName: '...',
        className: 'timetable-summary-stop-printout',
      });
    } else {
      for (let i = 1; i < stopsToBeHidden; i++) {
        stopData[stopData.length - 1 - i].className = 'timetable-summary-stop-printout-hidden';
      }

      stopData.splice(stopData.length - 2, 0, {
        color: routeColor,
        stopName: '...',
        className: 'timetable-summary-stop-printout',
      });
    }
  }

  return (
    <div className="timetable-summary-stop-list">
      {stopData.map((data, index, array) => (
        <div className={cx('timetable-summary-stop', data.className)} key={`timetable-summary-stop-${route.id}-${index}`}>
          <div className={cx('timetable-summary-stop_circleline', mode)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={15}
              height={30}
              style={{ fill: data.color, stroke: data.color }}
            >
              <circle
                strokeWidth="2"
                stroke={data.color}
                fill="white"
                cx="6"
                cy="13"
                r="5"
              />
            </svg>
            {index !== array.length - 1 && (
              <div
                className={cx('timetable-summary-stop_line', mode)}
                style={{ backgroundColor: data.color }}
              />
            )}
          </div>
          <div className={`timetable-summary-title ${mode}`} style={{ color: data.color }}>
            <div>
              <span>{data.stopName}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

TimetableSummaryStopList.propTypes = {
  currentStop: PropTypes.any.isRequired,
  stops: PropTypes.any.isRequired,
  route: PropTypes.any.isRequired,
};

export default TimetableSummaryStopList;
