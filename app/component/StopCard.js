import PropTypes from 'prop-types';
import React from 'react';
import StopCardHeaderContainer from './StopCardHeaderContainer';
import Card from './Card';

function StopCard(props) {
  if (!props.stop || !props.children || props.children.length === 0) {
    return false;
  }

  return (
    <Card className={props.className}>
      <StopCardHeaderContainer
        stop={props.stop}
        icons={props.icons}
        distance={props.distance}
        isPopUp={props.isPopUp}
        isTerminal={props.isTerminal}
        headingStyle="header-primary"
      />
      {props.children}
    </Card>
  );
}

StopCard.propTypes = {
  stop: PropTypes.shape({
    gtfsId: PropTypes.string.isRequired,
  }),
  icons: PropTypes.arrayOf(PropTypes.node),
  distance: PropTypes.number,
  isPopUp: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.node,
  isTerminal: PropTypes.bool,
};

export default StopCard;
