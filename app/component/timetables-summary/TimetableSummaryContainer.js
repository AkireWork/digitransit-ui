import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Link } from 'react-router';
import { FormattedMessage } from 'react-intl';
import Relay from 'react-relay/classic';
import cx from 'classnames';
import Icon from '../Icon';
import TimetableSummaryUrbanLines from './TimetableSummaryUrbanLines';
import withBreakpoint from '../../util/withBreakpoint';
import TimetableSummaryCountyLines from './TimetableSummaryCountyLines';
import StopPageMap from '../StopPageMap';

class TimetableSummaryContainer extends Component {
  static propTypes = {
    stop: PropTypes.shape({
      lat: PropTypes.number.isRequired,
      lon: PropTypes.number.isRequired,
      platformCode: PropTypes.string,
    }),
    breakpoint: PropTypes.string.isRequired,
    params: PropTypes.oneOfType([
      PropTypes.shape({ stopId: PropTypes.string.isRequired }).isRequired,
    ]).isRequired,
  };

  static defaultProps = {
    stop: undefined,
  };

  static contextTypes = {
    config: PropTypes.object.isRequired,
  };

  constructor(props, { config }) {
    super(props);
    const urbanLines = config.timetablesSelection.find(
      selection => selection.type === 'urban-lines',
    );
    const cityPatterns = props.stop.patterns.filter(pattern =>
      urbanLines.areas.find(area =>
        area.competent_authority.includes(pattern.route.competentAuthority),
      ),
    );

    this.state = {
      cityPatterns,
      otherPatterns: props.stop.patterns.filter(
        pattern =>
          !urbanLines.areas.find(area =>
            area.competent_authority.includes(pattern.route.competentAuthority),
          ),
      ),
      activeTab: cityPatterns.length > 0 ? 'urban-lines' : 'county-lines',
    };
  }

  openTab = tab => {
    this.setState({
      activeTab: tab,
    });
  };

  renderTabs() {
    const { breakpoint } = this.props;

    return (
      <div className="tabs route-tabs">
        <nav
          className={cx('tabs-navigation', {
            'bp-large': breakpoint === 'large',
          })}
        >
          <a
            className={cx({
              'is-active': this.state.activeTab === 'urban-lines',
            })}
            onClick={() => {
              this.openTab('urban-lines');
            }}
          >
            <div>
              <FormattedMessage id="urban-lines" defaultMessage="Linnaliinid" />
            </div>
          </a>
          <a
            className={cx({
              'is-active': this.state.activeTab === 'county-lines',
            })}
            onClick={() => {
              this.openTab('county-lines');
            }}
          >
            <div>
              <FormattedMessage
                id="county-lines"
                defaultMessage="Maakonnaliinid"
              />
            </div>
          </a>
        </nav>
      </div>
    );
  }

  render() {
    const { stop, breakpoint, params } = this.props;
    const { activeTab, cityPatterns, otherPatterns } = this.state;

    return (
      <div
        className={cx('fullscreen', breakpoint === 'large' ? 'desktop' : 'mobile')}
        style={{ display: 'block', flexDirection: 'unset' }}
      >
        <div className="desktop-title" style={{ background: 'inherit' }}>
          <h2 style={{ fontSize: '1em', display: 'flex'}}>
            <Link style={{ color: '#008bde', textDecoration: 'none' }} to="/">
              <Icon img="icon-icon_home" className="home-icon" />
            </Link>
            <Icon
              img="icon-icon_arrow-collapse--right"
              className="arrow-icon"
            />
            <div style={{ color: '#008bde', textDecoration: 'none' }}>
              <FormattedMessage
                id="timetable-summary"
                defaultMessage="Timetable Summary"
              />
              <Icon
                img="icon-icon_arrow-collapse--right"
                className="arrow-icon"
              />
              <span style={{ color: '#008bde', textDecoration: 'none' }}>
                {stop.name}
              </span>
            </div>
          </h2>
        </div>
        <h2 className="print-title">{stop.name}</h2>
        <div className="momentum-scroll timetable-summary-container">
          <div className="timetable-summary-map">
            <StopPageMap stop={stop} params={params} breakpoint={breakpoint} routes={[{fullscreenMap: ''}]}/>
          </div>
          {otherPatterns.length > 0 &&
            cityPatterns.length > 0 &&
            this.renderTabs()}

          {activeTab === 'urban-lines' && (
            <TimetableSummaryUrbanLines
              stop={stop}
              patterns={cityPatterns}
              breakpoint={breakpoint}
            />
          )}
          {activeTab === 'county-lines' && (
            <TimetableSummaryCountyLines
              stop={stop}
              patterns={otherPatterns}
              breakpoint={breakpoint}
            />
          )}
        </div>
      </div>
    );
  }
}

export default Relay.createContainer(
  withBreakpoint(TimetableSummaryContainer),
  {
    fragments: {
      stop: () => Relay.QL`
        fragment on Stop {
          gtfsId
          name
          lat
          lon
          
          patterns {
            id
            code
            name
            
            trip {
              tripLongName
              tripTimesWeekdaysGroups
            }
            
            patternTimetable (stopId: $stopId) {
              weekdays
              trip {
                id
                gtfsId
                tripShortName
                tripLongName
              }
              validity {
                validFrom
                validTill
              }
              times {
                stop {
                  gtfsId
                  name
                }
                headsign
                realtimeState
                scheduledArrival
                scheduledDeparture
                serviceDay
                pickupType
                dropoffType
              }
            }
            
            stops {
              gtfsId
              name
            }
            
            route {
              id
              gtfsId
              color
              mode
              shortName
              longName
              desc
              agency {
                name
              }
              competentAuthority
            }
          }
        }      
      `,
    },
    initialVariables: { stopId: null },
  },
);