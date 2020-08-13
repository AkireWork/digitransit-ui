import PropTypes from 'prop-types';
/* eslint-disable react/no-array-index-key */
import React from 'react';
import { Link } from 'react-router';
import { FormattedMessage } from 'react-intl';
import connectToStores from 'fluxible-addons-react/connectToStores';
import Icon from '../Icon';

const TimetablesSelectionArea = ({ params }, { config }) => {
  const timetablesSelections = config.timetablesSelection;
  return (
    <div className="fullscreen about-page">
      <div
        className="fullscreen momentum-scroll"
        style={{ width: '900px', maxWidth: '900px' }}
      >
        <div className="desktop-title" style={{ background: 'inherit' }}>
          <h2>
            <Link
              style={{ color: '#008bde', textDecoration: 'none' }}
              to="/aikataulut"
            >
              <Icon img="icon-icon_schedule" className="home-icon" />
            </Link>
            <Icon
              img="icon-icon_arrow-collapse--right"
              className="arrow-icon"
            />
            <Link
              style={{ color: '#008bde', textDecoration: 'none' }}
              to={`/aikataulut/${params.urbanOrCounty}`}
            >
              <FormattedMessage id={params.urbanOrCounty} />
            </Link>
          </h2>
        </div>
        {timetablesSelections
          .filter(t => t.type === params.urbanOrCounty)
          .map(timetablesSelection =>
            timetablesSelection.areas.map((area, i) => (
              <div
                style={{
                  margin: '2px 10px',
                  fontSize: '1.5em',
                }}
                className="row"
                key={i}
              >
                <Link
                  style={{ textDecoration: 'none' }}
                  to={`/aikataulut/${params.urbanOrCounty}/${i}`}
                >
                  <FormattedMessage id={area.name} />
                  <Icon
                    height={0.75}
                    img="icon-icon_arrow-collapse--right"
                    className="arrow-icon"
                  />
                </Link>
              </div>
            )),
          )}
        <Link to="/">
          <div className="call-to-action-button">
            <FormattedMessage
              id="back-to-front-page"
              defaultMessage="Back to front page"
            />
          </div>
        </Link>
      </div>
    </div>
  );
};
TimetablesSelectionArea.propTypes = {
  params: PropTypes.any.isRequired,
};

TimetablesSelectionArea.contextTypes = {
  config: PropTypes.object.isRequired,
};

const connectedComponent = connectToStores(
  TimetablesSelectionArea,
  ['PreferencesStore'],
  (context, props) => ({
    currentLanguage: context.getStore('PreferencesStore').getLanguage(),
    params: props.params,
  }),
);

export { connectedComponent as default, TimetablesSelectionArea as Component };
