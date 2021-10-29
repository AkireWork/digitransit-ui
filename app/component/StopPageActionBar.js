import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router';
import { FormattedMessage } from 'react-intl';
import DateSelect from './DateSelect';
import SecondaryButton from './SecondaryButton';
import { PREFIX_TIMETABLE_SUMMARY } from '../util/path';
import Icon from './Icon';

const DATE_FORMAT = 'YYYYMMDD';

const printStop = e => {
  e.stopPropagation();
  window.print();
};

const printStopPDF = (e, stopPDFURL) => {
  e.stopPropagation();

  window.open(stopPDFURL);
};

const StopPageActionBar = ({
  stopPDFURL,
  startDate,
  selectedDate,
  onDateChange,
  stop,
}) => (
  <div id="stop-page-action-bar">
    <DateSelect
      startDate={startDate}
      selectedDate={selectedDate}
      dateFormat={DATE_FORMAT}
      onDateChange={onDateChange}
    />
    <div className="button-container">
      <div className="timetable-summary-button">
        <Link to={`/${PREFIX_TIMETABLE_SUMMARY}/${stop.gtfsId}`}>
          <Icon img="icon-icon_schedule" />
          <div className="timetable-summary-button-label">
            <FormattedMessage
              id="timetable-summary"
              defaultMessage="Timetable Summary"
            />
          </div>
        </Link>
      </div>
      <div className="print-button-container">
        {stopPDFURL && (
          <SecondaryButton
            ariaLabel="print-timetable"
            buttonName="print-timetable"
            buttonClickAction={e => printStopPDF(e, stopPDFURL)}
            buttonIcon="icon-icon_print"
            smallSize
          />
        )}
        <SecondaryButton
          ariaLabel="print"
          buttonName="print"
          buttonClickAction={e => printStop(e)}
          buttonIcon="icon-icon_print"
          smallSize
        />
      </div>
    </div>
  </div>
);

StopPageActionBar.displayName = 'StopPageActionBar';

StopPageActionBar.propTypes = {
  startDate: PropTypes.string,
  selectedDate: PropTypes.string,
  onDateChange: PropTypes.func,
  stopPDFURL: PropTypes.string,
  stop: PropTypes.object,
};

export default StopPageActionBar;
