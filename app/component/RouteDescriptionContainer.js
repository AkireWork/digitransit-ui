import PropTypes from 'prop-types';
import React from 'react';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';

function DescriptionLine(description) {
  return <p>{description}</p>;
}

function RouteTypeLine(color) {
  switch (color) {
    case 'ff711d':
      return (
        <p>
          <FormattedMessage id="route-type-train" defaultMessage="Train" />
        </p>
      );
    case 'de2c42':
      return (
        <p>
          <FormattedMessage
            id="route-type-city-line-bus"
            defaultMessage="City line (Bus)"
          />
        </p>
      );
    case '016e12':
      return (
        <p>
          <FormattedMessage
            id="route-type-city-line-tram"
            defaultMessage="City line (Tram)"
          />
        </p>
      );
    case '1ccc48':
      return (
        <p>
          <FormattedMessage
            id="route-type-city-line-trolley"
            defaultMessage="City line (Trolley)"
          />
        </p>
      );
    case 'bd4819':
      return (
        <p>
          <FormattedMessage
            id="route-type-city-line-commercial"
            defaultMessage="City line (Commercial)"
          />
        </p>
      );
    case '3bb5db':
      return (
        <p>
          <FormattedMessage
            id="route-type-regional-line-pso"
            defaultMessage="Regional line (PSO)"
          />
        </p>
      );
    case '094f82':
      return (
        <p>
          <FormattedMessage
            id="route-type-regional-line-commercial"
            defaultMessage="Regional line (Commercial)"
          />
        </p>
      );
    case '660000':
      return (
        <p>
          <FormattedMessage
            id="route-type-long-distance-bus-line"
            defaultMessage="Long Distance Bus line"
          />
        </p>
      );
    case '8bb4c5':
      return (
        <p>
          <FormattedMessage id="route-type-ferry" defaultMessage="Ferry" />
        </p>
      );
    default:
      return <p />;
  }
}

function RouteDescriptionContainer({ route }) {
  const { color, mode, shortName, description } = route;

  return (
    <div style={{ paddingLeft: '20px' }}>
      {RouteTypeLine(color)}
      {description &&
        description.split('<br>').map(desc => DescriptionLine(desc))}
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
