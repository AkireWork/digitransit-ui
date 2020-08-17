import PropTypes from 'prop-types';
/* eslint-disable react/no-array-index-key */
import React from 'react';
import { Link } from 'react-router';
import { FormattedMessage } from 'react-intl';
import connectToStores from 'fluxible-addons-react/connectToStores';
import Relay from 'react-relay/classic';
import Icon from '../Icon';
import { PREFIX_ROUTES } from '../../util/path';

const Timetables = ({ routes, currentLanguage, params }, { config }) => {
  const timetablesSelection = config.timetablesSelection.find(
    t => t.type === params.urbanOrCounty,
  );
  const compare = (a, b) => {
    const rc = timetablesSelection.route_colors;
    let x = a.color;
    let y = b.color;
    if (!x.startsWith('#')) {
      x = `#${x}`;
    }
    if (!y.startsWith('#')) {
      y = `#${y}`;
    }
    if (rc.indexOf(x) < rc.indexOf(y)) {
      return -1;
    }
    if (rc.indexOf(x) > rc.indexOf(y)) {
      return 1;
    }
    return 0;
  };
  return (
    <div
      className="fullscreen"
      style={{ display: 'block', flexDirection: 'unset' }}
    >
      <div className="desktop-title" style={{ background: 'inherit' }}>
        <h2>
          <Link
            style={{ color: '#008bde', textDecoration: 'none' }}
            to="/aikataulut"
          >
            <Icon img="icon-icon_schedule" className="home-icon" />
          </Link>
          <Icon img="icon-icon_arrow-collapse--right" className="arrow-icon" />
          <Link
            style={{ color: '#008bde', textDecoration: 'none' }}
            to={`/aikataulut/${params.urbanOrCounty}`}
          >
            <FormattedMessage id={params.urbanOrCounty} />
          </Link>
          <Icon img="icon-icon_arrow-collapse--right" className="arrow-icon" />
          <Link
            style={{ color: '#008bde', textDecoration: 'none' }}
            to={`/aikataulut/${params.urbanOrCounty}/${params.idx}`}
          >
            {timetablesSelection.areas[params.idx].name}
          </Link>
        </h2>
      </div>
      <div className="momentum-scroll">
        {routes &&
          routes.routes &&
          routes.routes
            .filter(
              r =>
                timetablesSelection.route_colors.includes(r.color) ||
                timetablesSelection.route_colors.includes(`#${r.color}`),
            )
            .sort(
              (a, b) =>
                compare(a, b) ||
                a.shortName.localeCompare(b.shortName, 'en', { numeric: true }),
            )
            .map((routeItem, index) => (
              <div
                style={{
                  margin: '3px 10px',
                  fontSize: '1.5em',
                  background: 'inherit',
                }}
                className="row departure"
                key={index}
              >
                <Link
                  style={{ textDecoration: 'none' }}
                  to={`/${PREFIX_ROUTES}/${routeItem.patterns[0].route.gtfsId ||
                    routeItem.patterns[0].route.gtfsId}/aikataulu/${
                    routeItem.patterns[0].code
                  }`}
                >
                  <Icon
                    height={0.75}
                    img={`icon-icon_${timetablesSelection.icon_type}`}
                    color={routeItem.color}
                  />
                  <div
                    style={{
                      width: '75px',
                      display: 'inline-block',
                      margin: 'auto auto',
                      paddingLeft: '5px',
                    }}
                  >
                    {routeItem.shortName}
                  </div>
                  <span>{routeItem.longName}</span>
                </Link>
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

Timetables.propTypes = {
  currentLanguage: PropTypes.string.isRequired,
  routes: PropTypes.object.isRequired,
  params: PropTypes.any.isRequired,
};

Timetables.contextTypes = {
  config: PropTypes.object.isRequired,
};

export default Relay.createContainer(
  connectToStores(Timetables, ['PreferencesStore'], context => ({
    currentLanguage: context.getStore('PreferencesStore').getLanguage(),
  })),
  {
    fragments: {
      routes: () => Relay.QL`
      fragment on QueryType { 
        routes(competentAuthority:$competentAuthority) {
          shortName
          longName
          competentAuthority
          color
          patterns {
            headsign
            code
            route {
              gtfsId
            }
          }
        }
      }
    `,
    },
    initialVariables: { competentAuthority: [] },
  },
);
