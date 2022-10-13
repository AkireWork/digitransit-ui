import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';

import MarkerPopupBottom from '../MarkerPopupBottom';
import Card from '../../Card';
import CardHeader from '../../CardHeader';
import ComponentUsageExample from '../../ComponentUsageExample';
import { getAmenityIcon } from '../../../util/mapIconUtils';
import {getAmenityName, getAmenityType} from "../../../util/mapLayerUtils";

export default class AmenityPopup extends React.Component {
  static contextTypes = { intl: intlShape.isRequired };

  static description = (
    <div>
      <p>Renders an Amenity popup.</p>
      <ComponentUsageExample description="">
        <AmenityPopup context="context object here">
          Im content of a Amenity card
        </AmenityPopup>
      </ComponentUsageExample>
    </div>
  );

  static propTypes = {
    name: PropTypes.string.isRequired,
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired,
    properties: PropTypes.object.isRequired,
  };

  render() {
    const icon = getAmenityIcon(getAmenityType(this.props.properties));

    const name = getAmenityName(this.props.properties, this.props.name, this.context.intl);

    return (
      <Card>
        <div className="padding-small">
          <CardHeader
            name={name}
            icon={icon}
            unlinked
            className="padding-small"
          />
        </div>
        <MarkerPopupBottom
          location={{
            address: this.props.name,
            lat: this.props.lat,
            lon: this.props.lon,
          }}
        />
      </Card>
    );
  }
}
