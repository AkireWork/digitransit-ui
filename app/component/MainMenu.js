import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, intlShape } from 'react-intl';
import { Link } from 'react-router';

import DisruptionInfoButtonContainer from './DisruptionInfoButtonContainer';
import Icon from './Icon';
import LangSelect from './LangSelect';
import MainMenuLinks from './MainMenuLinks';
import connectToStores from 'fluxible-addons-react/connectToStores';

function MainMenu(props, { config, intl }) {
  /* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
  const footerLinks = config.footer[props.currentLanguage];
  return (
    <div aria-hidden={!props.visible} className="main-menu no-select">
      <button
        onClick={props.toggleVisibility}
        className="close-button cursor-pointer"
        aria-label={intl.formatMessage({
          id: 'main-menu-label-close',
          defaultMessage: 'Close the main menu',
        })}
      >
        <Icon img="icon-icon_close" className="medium" />
      </button>
      <header className="offcanvas-section">
        <LangSelect />
      </header>
      <div className="offcanvas-section">
        <Link id="frontpage" to={props.homeUrl}>
          <FormattedMessage id="frontpage" defaultMessage="Frontpage" />
        </Link>
      </div>
      {config.mainMenu.showDisruptions &&
        props.showDisruptionInfo && (
          <div className="offcanvas-section">
            <DisruptionInfoButtonContainer />
          </div>
        )}
      <MainMenuLinks
        content={(
          [config.appBarLink].concat(footerLinks) ||
          []
        ).filter(item => item.href || item.route)}
      />
    </div>
  );
}

MainMenu.propTypes = {
  showDisruptionInfo: PropTypes.bool,
  toggleVisibility: PropTypes.func.isRequired,
  visible: PropTypes.bool,
  homeUrl: PropTypes.string.isRequired,
  currentLanguage: PropTypes.string.isRequired,
};

MainMenu.defaultProps = {
  visible: true,
};

MainMenu.contextTypes = {
  getStore: PropTypes.func.isRequired,
  config: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
};

const connectedComponent = connectToStores(
  MainMenu,
  ['PreferencesStore'],
  context => ({
    currentLanguage: context.getStore('PreferencesStore').getLanguage(),
  }),
);

export { connectedComponent as default, MainMenu as Component };
