import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';

import Icon from '../../Icon';
import ComponentUsageExample from '../../ComponentUsageExample';
import {getAmenityName, getAmenityType} from "../../../util/mapLayerUtils";
import {getAmenityIcon} from "../../../util/mapIconUtils";
/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
function SelectAmenitiesRow(props, { intl }) {
  return (
    <div className="no-margin">
      <div className="cursor-pointer select-row" onClick={props.selectRow}>
        <div className="padding-vertical-normal select-row-icon">
          <Icon img={getAmenityIcon(getAmenityType(props))} />
        </div>
        <div className="padding-vertical-normal select-row-text">
          <span className="header-primary no-margin link-color">
            {getAmenityName(props, 'Huvipunkt', intl)}
          </span>
        </div>
        <div className="clear" />
      </div>
      <hr className="no-margin gray" />
    </div>
  );
}

SelectAmenitiesRow.displayName = 'SelectAmenitiesRow';

SelectAmenitiesRow.description = (
  <div>
    <p>Renders a select amenities row</p>
    <ComponentUsageExample description="">
      <SelectAmenitiesRow
        name={'{"en": "Amenities", "fi": "Amenities", "sv": "Amenities"}'}
        selectRow={() => {}}
      />
    </ComponentUsageExample>
  </div>
);

SelectAmenitiesRow.propTypes = {
  selectRow: PropTypes.func.isRequired,
  name: PropTypes.string,
};

SelectAmenitiesRow.contextTypes = {
  intl: intlShape,
};

export default SelectAmenitiesRow;
