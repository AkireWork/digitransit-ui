import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

const TimetableSummaryStopList = ({ currentStop, stops, route }, { config }) => {
  const mode = route.mode;
  const routeColor = route ? `#${route.color}` : null;
  const inactiveColor = 'lightgray';

  const stopComponentsList = [];
  let isStopReached = false;
  stops.forEach((stop, index, array) => {
    if (currentStop.gtfsId === stop.gtfsId) {
      isStopReached = true;
    }

    const color = isStopReached ? routeColor : inactiveColor;
    stopComponentsList.push(
      <div className={cx('timetable-summary-stop')} key={`timetable-summary-stop-${route.id}-${index}`}>
        <div className={cx('timetable-summary-stop_circleline', mode)}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={15}
            height={30}
            style={{ fill: color, stroke: color }}
          >
            <circle
              strokeWidth="2"
              stroke={color}
              fill="white"
              cx="6"
              cy="13"
              r="5"
            />
          </svg>
          {index !== array.length - 1 && (
            <div
              className={cx('timetable-summary-stop_line', mode)}
              style={{ backgroundColor: color }}
            />
          )}
        </div>
        <div className={`timetable-summary-title ${mode}`} style={{ color }}>
          <div>
            <span>{stop.name}</span>
          </div>
        </div>
      </div>,
    );
  });

  return (
    <div className="timetable-summary-stop-list">{stopComponentsList}</div>
  );
};

TimetableSummaryStopList.propTypes = {
  currentStop: PropTypes.any.isRequired,
  stops: PropTypes.any.isRequired,
  route: PropTypes.any.isRequired,
};

export default TimetableSummaryStopList;
