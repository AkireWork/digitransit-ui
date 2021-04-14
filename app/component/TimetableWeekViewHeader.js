import PropTypes from 'prop-types';
import React from 'react';

export default function TimetableWeekViewHeader({ route, tripLongName }) {
  return (
    <div className="timetable-header-container">
      <div style={{ display: 'flex', marginBottom: '20px' }}>
        <span style={{ margin: '20px', fontSize: '30px' }}>
          {route.shortName}
        </span>
        <div style={{ display: 'grid', fontSize: '11px' }}>
          <span style={{ fontSize: '20px' }}>{route.longName}</span>
          <span>Vedaja: {route.agency.name}</span>
          <span>Korraldaja: {route.competentAuthority}</span>
          <span>Maakonnaliin (avalik)</span>
        </div>
      </div>
      <span>{tripLongName}</span>
    </div>
  );
}

TimetableWeekViewHeader.propTypes = {
  route: PropTypes.shape({
    shortName: PropTypes.string.isRequired,
    longName: PropTypes.string.isRequired,
    agency: PropTypes.shape({ name: PropTypes.string.isRequired }),
    competentAuthority: PropTypes.string.isRequired,
  }).isRequired,
  tripLongName: PropTypes.string.isRequired,
};
