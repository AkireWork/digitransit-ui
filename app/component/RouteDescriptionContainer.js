import PropTypes from 'prop-types';
import React from 'react';
import Relay from 'react-relay/classic';

function DescriptionLine(description) {
  return <p>{description}</p>;
}

function RouteDescriptionContainer({ route }) {
  const { color, mode, shortName, description } = route;

  return (
    <div style={{ paddingLeft: '20px' }}>
      {description.split('<br>').map(desc => DescriptionLine(desc))}
    </div>
  );
}

RouteDescriptionContainer.propTypes = {
  route: PropTypes.shape({
    color: PropTypes.string,
    mode: PropTypes.string.isRequired,
    shortName: PropTypes.string.isRequired,
    description: PropTypes.string,
  }).isRequired,
};

const containerComponent = Relay.createContainer(RouteDescriptionContainer, {
  fragments: {
    route: () => Relay.QL`
      fragment on Route {
        color
        mode
        shortName
        description
      }
    `,
  },
});

export {
  containerComponent as default,
  RouteDescriptionContainer as Component,
};
