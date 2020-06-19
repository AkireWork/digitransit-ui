import PropTypes from 'prop-types';
import React from 'react';
import connectToStores from 'fluxible-addons-react/connectToStores';
import ComponentUsageExample from './ComponentUsageExample';
import FooterItem from './FooterItem';

const PageFooter = ({ currentLanguage }, { config }) => {
  const footerContent = config.footer[currentLanguage];

  return (
    <div id="page-footer">
      {footerContent &&
        footerContent.map(
          (link, i) =>
            Object.keys(link).length === 0 ? (
              // eslint-disable-next-line react/no-array-index-key
              <span className="footer-separator" key={i} />
            ) : (
              <FooterItem key={link.label || link.name} {...link} />
            ),
        )}
    </div>
  );
};

PageFooter.propTypes = {
  currentLanguage: PropTypes.string.isRequired,
};

PageFooter.contextTypes = {
  config: PropTypes.object.isRequired,
};

PageFooter.displayName = 'PageFooter';

const connectedComponent = connectToStores(
  PageFooter,
  ['PreferencesStore'],
  context => ({
    currentLanguage: context.getStore('PreferencesStore').getLanguage(),
  }),
);

PageFooter.description = () => (
  <div>
    <p>Front page footer for large display</p>
    <ComponentUsageExample description="">
      <PageFooter
        content={[
          { name: 'Feedback', icon: 'icon-icon_speech-bubble', route: '/' },
          {},
          { name: 'Print', icon: 'icon-icon_print', route: '/' },
          {},
          { name: 'Home', icon: 'icon-icon_place', route: '/' },
        ]}
      />
    </ComponentUsageExample>
  </div>
);

export { connectedComponent as default, PageFooter as Component };
