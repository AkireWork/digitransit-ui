import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import ComponentUsageExample from './ComponentUsageExample';

const CityBikeAvailability = ({
  bikesAvailable,
  totalSpaces,
  freeDocks,
  pedelecBikesAvailable,
}) => {
  const total = Number.isNaN(totalSpaces) ? 0 : totalSpaces;
  const free = Number.isNaN(freeDocks) ? 0 : freeDocks;
  const available = Number.isNaN(bikesAvailable) ? 0 : bikesAvailable;
  const eAvailable = Number.isNaN(pedelecBikesAvailable)
    ? 0
    : pedelecBikesAvailable;

  return (
    <div className="availability-container">
      <p className="sub-header-h4 availability-header">
        <div className="availability-row">
          <img
            src="/img/bike-availability/bikes_infowindow2.e7b121f225870c7bee9a.png"
            alt="Bicycle"
          />
          <div>
            <strong>{available}</strong>
            {'\u00a0'}
            <FormattedMessage id="bike-available" defaultMessage="Bikes" />
          </div>
        </div>
        <div className="availability-row">
          <img
            src="/img/bike-availability/pedelec_infowindow2.fc7a773be29bf91481f0.png"
            alt="Electric Bicycle"
          />
          <div>
            <strong>{eAvailable}</strong>
            {'\u00a0'}
            <FormattedMessage
              id="ebike-available"
              defaultMessage="Pedelec Bikes"
            />
          </div>
        </div>
        <div className="availability-row">
          <img
            src="/img/bike-availability/docks_infowindow2.d3b1ffcdd40394116102.png"
            alt="Dock"
          />
          <div>
            <strong>{free}</strong>
            {'\u00a0'}
            <FormattedMessage id="dock-available" defaultMessage="Docks" />
          </div>
        </div>
      </p>
    </div>
  );
};

CityBikeAvailability.displayName = 'CityBikeAvailability';

CityBikeAvailability.description = () => (
  <div>
    <p>Renders information about citybike availability</p>
    <ComponentUsageExample description="">
      <CityBikeAvailability
        bikesAvailable={1}
        totalSpaces={3}
        fewAvailableCount={3}
        type="citybike"
      />
    </ComponentUsageExample>
  </div>
);

CityBikeAvailability.propTypes = {
  bikesAvailable: PropTypes.number.isRequired,
  totalSpaces: PropTypes.number.isRequired,
  freeDocks: PropTypes.string.isRequired,
  pedelecBikesAvailable: PropTypes.string.isRequired,
};

export default CityBikeAvailability;
