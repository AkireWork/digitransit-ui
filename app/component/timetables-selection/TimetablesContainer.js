import PropTypes from 'prop-types';
/* eslint-disable react/no-array-index-key */
import React from 'react';
import connectToStores from 'fluxible-addons-react/connectToStores';
import Relay from 'react-relay/classic';
import Timetables from './Timetables';

const TimetablesContainer = ({ currentLanguage, params }, { config }) => {
  const timetablesSelection = config.timetablesSelection.find(
    t => t.type === params.urbanOrCounty,
  );
  console.log(
    params,
    timetablesSelection,
    timetablesSelection.areas[params.idx].competent_authority,
  );
  return (
    timetablesSelection && (
      <Relay.RootContainer
        Component={Timetables}
        forceFetch
        route={{
          name: 'TimetablesRoute',
          queries: {
            routes: (Component, { competentAuthority }) => Relay.QL` 
            query {
              viewer {
                ${Component.getFragment('routes', { competentAuthority })}
              }
            }
        `,
          },
          params: {
            competentAuthority:
              timetablesSelection.areas[params.idx].competent_authority,
          },
        }}
        renderFetched={data => <Timetables params={params} {...data} />}
      />
    )
  );
};

TimetablesContainer.propTypes = {
  currentLanguage: PropTypes.string.isRequired,
  params: PropTypes.any.isRequired,
};

TimetablesContainer.contextTypes = {
  config: PropTypes.object.isRequired,
};

const connectedComponent = connectToStores(
  TimetablesContainer,
  ['PreferencesStore'],
  (context, props) => ({
    currentLanguage: context.getStore('PreferencesStore').getLanguage(),
    params: props.params,
  }),
);

export { connectedComponent as default, TimetablesContainer as Component };
