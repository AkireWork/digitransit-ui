import PropTypes from 'prop-types';
/* eslint-disable react/no-array-index-key */
import React from 'react';
import { Link } from 'react-router';
import { FormattedMessage } from 'react-intl';
import connectToStores from 'fluxible-addons-react/connectToStores';

class AboutPage extends React.Component {
  constructor(props, { config }) {
    super(props);

    this.state = {
      logo: '',
      conf: config.CONFIG,
      img: config.aboutThisService[props.currentLanguage]
        .filter(about => !!about.img)
        .map(about => about.img)[0],
    };
  }

  componentDidMount() {
    import(/* webpackChunkName: "main" */ `../configurations/images/${
      this.state.conf
    }/${this.state.img}`).then(logo => {
      this.setState({ logo: logo.default });
    });
  }

  render() {
    const { config } = this.context;
    const { currentLanguage } = this.props;
    const about = config.aboutThisService[currentLanguage];

    return (
      <div className="about-page fullscreen">
        <div className="page-frame fullscreen momentum-scroll">
          {about.map(
            (section, i) =>
              (section.paragraphs && section.paragraphs.length) ||
              section.link ||
              section.img ? (
                <div key={`about-section-${i}`}>
                  <h1 className="about-header">{section.header}</h1>
                  {section.paragraphs &&
                    section.paragraphs.map((p, j) => (
                      <p key={`about-section-${i}-p-${j}`}>{p}</p>
                    ))}
                  {section.link && (
                    <a href={section.link}>
                      <FormattedMessage
                        id="extra-info"
                        defaultMessage="More information"
                      />
                    </a>
                  )}
                  {section.img && (
                    <img
                      width="50%"
                      // eslint-disable-next-line global-require
                      src={this.state.logo}
                      alt="logo"
                    />
                  )}
                </div>
              ) : (
                false
              ),
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
  }
}

AboutPage.propTypes = {
  currentLanguage: PropTypes.string.isRequired,
};

AboutPage.contextTypes = {
  config: PropTypes.object.isRequired,
};

const connectedComponent = connectToStores(
  AboutPage,
  ['PreferencesStore'],
  context => ({
    currentLanguage: context.getStore('PreferencesStore').getLanguage(),
  }),
);

export { connectedComponent as default, AboutPage as Component };
