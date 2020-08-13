import PropTypes from 'prop-types';
/* eslint-disable react/no-array-index-key */
import React from 'react';
import { Link } from 'react-router';
import { FormattedMessage } from 'react-intl';
import connectToStores from 'fluxible-addons-react/connectToStores';
import Icon from '../Icon';

const TimetablesSelection = ({ currentLanguage, path }, { config }) => {
  const timetablesSelections = config.timetablesSelection;
  return (
    <div className="fullscreen about-page">
      <div
        className="fullscreen momentum-scroll"
        style={{ width: '900px', maxWidth: '900px' }}
      >
        <div
          className="desktop-title"
          style={{ fontSize: '1.5em', background: 'inherit' }}
        >
          <h2>
            <Link
              style={{ color: '#008bde', textDecoration: 'none' }}
              to="/aikataulut"
            >
              <Icon img="icon-icon_schedule" className="home-icon" />
              <FormattedMessage id="timetables" defaultMessage="Timetables" />
            </Link>
          </h2>
        </div>
        {timetablesSelections.map((timetablesSelection, i) => (
          <div
            style={{
              margin: '2px 10px',
              fontSize: '1.5em',
            }}
            className="row"
            key={i}
          >
            {timetablesSelection.areas.length > 1 ? (
              <Link
                style={{ textDecoration: 'none' }}
                to={`/aikataulut/${timetablesSelection.type}`}
              >
                <Icon
                  height={0.75}
                  img={`icon-icon_${timetablesSelection.icon_type}`}
                  className=""
                />
                <FormattedMessage id={timetablesSelection.type} />
                <Icon
                  height={0.75}
                  img="icon-icon_arrow-collapse--right"
                  className="arrow-icon"
                />
              </Link>
            ) : (
              <Link
                style={{ textDecoration: 'none' }}
                to={`/aikataulut/${timetablesSelection.type}/0`}
              >
                <Icon
                  height={0.75}
                  img={`icon-icon_${timetablesSelection.icon_type}`}
                  className=""
                />
                <FormattedMessage id={timetablesSelection.type} />
                <Icon
                  height={0.75}
                  img="icon-icon_arrow-collapse--right"
                  className="arrow-icon"
                />
              </Link>
            )}
          </div>
        ))}
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

TimetablesSelection.propTypes = {
  currentLanguage: PropTypes.string.isRequired,
  path: PropTypes.any.isRequired,
};

TimetablesSelection.contextTypes = {
  config: PropTypes.object.isRequired,
};

const connectedComponent = connectToStores(
  TimetablesSelection,
  ['PreferencesStore'],
  (context, { routes }) => ({
    currentLanguage: context.getStore('PreferencesStore').getLanguage(),
    path: routes,
  }),
);

export { connectedComponent as default, TimetablesSelection as Component };
