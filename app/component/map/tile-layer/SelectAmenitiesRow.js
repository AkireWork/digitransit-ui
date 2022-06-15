import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';

import Icon from '../../Icon';
import ComponentUsageExample from '../../ComponentUsageExample';
/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
function SelectAmenitiesRow(props, { intl }) {
  return (
    <div className="no-margin">
      <div className="cursor-pointer select-row" onClick={props.selectRow}>
        <div className="padding-vertical-normal select-row-icon">
          <Icon img="icon-icon_car" />
        </div>
        <div className="padding-vertical-normal select-row-text">
          <span className="header-primary no-margin link-color">
            {JSON.parse(props.name)[intl.locale]} ›
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
  name: PropTypes.string.isRequired,
};

SelectAmenitiesRow.contextTypes = {
  intl: intlShape,
};

export default SelectAmenitiesRow;
