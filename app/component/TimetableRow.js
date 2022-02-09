import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { LocalTime } from './LocalTime';
import RouteNumberContainer from './RouteNumberContainer';

const TimetableRow = ({ route, showRoutes }) =>
  ((showRoutes.filter(o => o === route.id).length > 0 &&
    showRoutes.length > 0) ||
    showRoutes.length === 0) && (
    <p
      className={cx(
        'departure',
        'route-detail-text',
        'padding-normal',
        'border-bottom',
      )}
    >
      <span className={cx('time')}>
        <LocalTime
          forceUtc={false}
          time={route.serviceDay + route.scheduledDeparture}
        />
      </span>
      <RouteNumberContainer route={route} isCallAgency={false} />
      <span className={cx('route-destination')}>
        <span className="destination" title={route.longName}>
          {route.longName}
        </span>
      </span>
    </p>
  );

TimetableRow.propTypes = {
  route: PropTypes.shape({
    name: PropTypes.string.isRequired,
    shortName: PropTypes.string.isRequired,
    mode: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    serviceDay: PropTypes.number.isRequired,
    scheduledDeparture: PropTypes.number.isRequired,
  }).isRequired,
  showRoutes: PropTypes.arrayOf(PropTypes.string),
};

TimetableRow.defaultProps = {
  showRoutes: [],
};

export default TimetableRow;
