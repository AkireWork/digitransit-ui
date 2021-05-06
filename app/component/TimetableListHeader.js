import React from 'react';
import { FormattedMessage } from 'react-intl';
import ComponentUsageExample from './ComponentUsageExample';

const TimetableListHeader = () => (
  <div className="departure-list-header row padding-vertical-small">
    <span className="time-header">
      <FormattedMessage id="leaves" defaultMessage="Leaves" />
    </span>
    <span className="route-number-header">
      <FormattedMessage id="route" defaultMessage="Route" />
    </span>
    <span className="route-destination-header">
      <FormattedMessage id="direction" defaultMessage="Destination" />
    </span>
  </div>
);

TimetableListHeader.displayName = 'TimetableListHeader';

TimetableListHeader.defaultProps = {
  staticDeparture: false,
};

TimetableListHeader.description = () => (
  <div>
    <ComponentUsageExample>
      <TimetableListHeader />
    </ComponentUsageExample>
  </div>
);

export default TimetableListHeader;
