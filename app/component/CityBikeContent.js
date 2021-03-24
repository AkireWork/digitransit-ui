import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import CityBikeAvailability from './CityBikeAvailability';
import { BIKESTATION_ON, getCityBikeType } from '../util/citybikes';
import ComponentUsageExample from './ComponentUsageExample';
import { station as exampleStation, lang as exampleLang } from './ExampleData';

const CityBikeContent = ({ station, lang }, { config }) => (
  <div className="city-bike-container">
    {station.state !== BIKESTATION_ON ? (
      <p className="sub-header-h4 availability-header">
        <FormattedMessage
          id="citybike_off"
          defaultMessage="Bike station closed"
        />
      </p>
    ) : (
      <CityBikeAvailability
        bikesAvailable={station.bikesAvailable}
        // pedelecBikesAvailable={station.pedelecBikesAvailable} // TODO: get 
        pedelecBikesAvailable={0}
        freeDocks={station.spacesAvailable}
        totalSpaces={station.bikesAvailable + station.spacesAvailable}
        fewAvailableCount={config.cityBike.fewAvailableCount}
        type={getCityBikeType(station.networks, config)}
      />
    )}
  </div>
);

CityBikeContent.displayName = 'CityBikeContent';

CityBikeContent.description = () => (
  <div>
    <p>Renders content of a citybike card</p>
    <ComponentUsageExample description="">
      <CityBikeContent station={exampleStation} lang={exampleLang} />
    </ComponentUsageExample>
  </div>
);

CityBikeContent.propTypes = {
  station: PropTypes.object.isRequired,
  lang: PropTypes.string.isRequired,
};

CityBikeContent.contextTypes = {
  config: PropTypes.object.isRequired,
};

export default CityBikeContent;
