import Relay from 'react-relay/classic';
import React from 'react';
import PropTypes from 'prop-types';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { locationShape, routerShape } from 'react-router';
import Loading from './Loading';
import TimetableWeekView from './TimetableWeekView';
import Modal from './Modal';

function TimetableWeekViewContainer(
  { tripId, params },
  { config, location, router },
) {
  const isOpen = () =>
    location.state ? location.state.weekViewOpen : false;
  if (!isOpen()) {
    return null;
  }

  const toggleVisibility = () => {
    if (isOpen()) {
      router.goBack();
    } else {
      router.push({
        ...location,
        state: {
          ...location.state,
          weekViewOpen: true,
        },
      });
    }
  };
  return (
    <Modal open toggleVisibility={toggleVisibility}>
      <Relay.RootContainer
        Component={TimetableWeekView}
        forceFetch
        route={{
          name: 'ViewerRoute',
          queries: {
            trip: Component => Relay.QL`
                query {
                  viewer {
                    ${Component.getFragment('trip', {
                      tripId,
                    })}
                  }
                }
             `,
          },
          params: {
            tripId,
          },
        }}
        renderLoading={() => <Loading />}
        renderFetched={data => <TimetableWeekView params={params} {...data} />}
      />
    </Modal>
  );
}

TimetableWeekViewContainer.contextTypes = {
  config: PropTypes.object.isRequired,
  location: locationShape.isRequired,
  router: routerShape.isRequired,
};

TimetableWeekViewContainer.propTypes = {
  currentTime: PropTypes.number.isRequired,
  tripId: PropTypes.string.isRequired,
};

const connectedComponent = connectToStores(
  TimetableWeekViewContainer,
  ['TimeStore'],
  (context, props) => ({
    currentTime: context
      .getStore('TimeStore')
      .getCurrentTime()
      .unix(),
    params: props.params,
  }),
);

export {
  connectedComponent as default,
  TimetableWeekViewContainer as Component,
};
