import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import Relay from 'react-relay/classic';
import { FormattedMessage, intlShape } from 'react-intl';
import cx from 'classnames';
import { Link, routerShape } from 'react-router';

import Icon from './Icon';
import CallAgencyWarning from './CallAgencyWarning';
import FavouriteRouteContainer from './FavouriteRouteContainer';
import RoutePatternSelect from './RoutePatternSelect';
import RouteAgencyInfo from './RouteAgencyInfo';
import RouteNumber from './RouteNumber';
import { DATE_FORMAT } from '../constants';
import {
  startRealTimeClient,
  stopRealTimeClient,
  changeRealTimeClientTopics,
} from '../action/realTimeClientAction';
import {
  getCancelationsForRoute,
  getServiceAlertsForRoute,
  getServiceAlertsForRouteStops,
  isAlertActive,
} from '../util/alertUtils';
import { PREFIX_ROUTES, PREFIX_TIMETABLE_SUMMARY } from '../util/path';
import withBreakpoint from '../util/withBreakpoint';
import { RouteAlertsQuery, StopAlertsQuery } from '../util/alertQueries';
import BackButton from './BackButton';

const Tab = {
  Disruptions: 'hairiot',
  Stops: 'pysakit',
  Timetable: 'aikataulu',
};

const getActiveTab = pathname => {
  if (pathname.indexOf(`/${Tab.Disruptions}`) > -1) {
    return Tab.Disruptions;
  }
  if (pathname.indexOf(`/${Tab.Stops}`) > -1) {
    return Tab.Stops;
  }
  if (pathname.indexOf(`/${Tab.Timetable}`) > -1) {
    return Tab.Timetable;
  }
  return undefined;
};

class RoutePage extends React.Component {
  static contextTypes = {
    getStore: PropTypes.func.isRequired,
    executeAction: PropTypes.func.isRequired,
    router: routerShape.isRequired,
    intl: intlShape.isRequired,
    config: PropTypes.object.isRequired,
  };

  static propTypes = {
    route: PropTypes.object.isRequired,
    location: PropTypes.shape({
      pathname: PropTypes.string.isRequired,
    }).isRequired,
    params: PropTypes.shape({
      patternId: PropTypes.string.isRequired,
      timetable: PropTypes.string,
    }).isRequired,
    breakpoint: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      validFrom: this.getValidFrom(),
    };
  }

  getValidFrom() {
    const { location } = this.props;
    let validFrom = '';
    const uri = decodeURIComponent(location.pathname);
    if (uri.includes('ajanjakso')) {
      validFrom = uri.substr(uri.length - 8, 8);
      validFrom = `${validFrom.substr(0, 2)}.${validFrom.substr(
        2,
        2,
      )}.${validFrom.substr(4, 4)}`;
    }
    return validFrom;
  }

  // gets called if pattern has not been visited before
  componentDidMount() {
    const { params, route } = this.props;
    const { config, executeAction } = this.context;
    const { realTime } = config;
    if (!realTime || route == null) {
      return;
    }

    const routeParts = route.gtfsId.split(':');
    const agency = routeParts[0];
    const source = realTime[agency];
    if (!source || !source.active) {
      return;
    }

    const pattern = route.patterns.find(
      ({ code }) => code === params.patternId,
    );
    if (!pattern) {
      return;
    }

    const id = source.routeSelector(this.props);
    executeAction(startRealTimeClient, {
      ...source,
      agency,
      options: [
        {
          route: id,
          // add some information from the context
          // to compensate potentially missing feed data
          mode: route.mode.toLowerCase(),
          gtfsId: routeParts[1],
          headsign: pattern.headsign,
        },
      ],
    });
  }

  componentWillUnmount() {
    const { client } = this.context.getStore('RealTimeInformationStore');
    if (client) {
      this.context.executeAction(stopRealTimeClient, client);
    }
  }

  onPatternChange = newPattern => {
    const { location, params, route } = this.props;
    const { config, executeAction, getStore, router } = this.context;
    const { client, topics } = getStore('RealTimeInformationStore');
    let validFrom;
    let patternCode = newPattern;

    if (newPattern) {
      const patternInfo = newPattern.split(' ');
      if (patternInfo.length === 2) {
        patternCode = patternInfo[0];
        validFrom = patternInfo[1];
      } else {
        patternCode = patternInfo[0];
        validFrom = '';
      }
    }

    this.setState({ validFrom });
    console.log(`route page: ${this.state.validFrom}`);
    // if config contains mqtt feed and old client has not been removed
    if (client) {
      const { realTime } = config;
      const routeParts = route.gtfsId.split(':');
      const agency = routeParts[0];
      const source = realTime[agency];

      const pattern = route.patterns.find(({ code }) => code === patternCode);
      if (pattern) {
        const id = source.routeSelector(this.props);
        executeAction(changeRealTimeClientTopics, {
          ...source,
          agency,
          options: [
            {
              route: id,
              mode: route.mode.toLowerCase(),
              gtfsId: routeParts[1],
              headsign: pattern.headsign,
            },
          ],
          oldTopics: topics,
          client,
        });
      }
    }

    let uri = decodeURIComponent(location.pathname);
    uri = uri.replace(new RegExp(`${params.patternId}(.*)`), patternCode);
    if (validFrom !== undefined && validFrom !== '') {
      if (uri.includes('ajanjakso')) {
        uri =
            uri.substr(0, uri.length - 8) +
            validFrom.replaceAll('.', '');
      } else {
        uri = `${uri}/ajanjakso/${validFrom.replaceAll('.', '')}`;
      }
    }
    router.replace(
      uri,
    );
  };

  changeTab = tab => {
    const path = `/${PREFIX_ROUTES}/${this.props.route.gtfsId}/${tab}/${this
      .props.params.patternId || ''}`;
    this.context.router.replace(path);
  };

  /* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions, jsx-a11y/anchor-is-valid */
  render() {
    const { breakpoint, location, params, route } = this.props;
    const { patternId, stopId } = params;
    const { config, router } = this.context;

    if (route == null) {
      /* In this case there is little we can do
       * There is no point continuing rendering as it can only
       * confuse user. Therefore redirect to Routes page */
      router.replace(`/${PREFIX_ROUTES}`);
      return null;
    }

    const activeTab = getActiveTab(location.pathname);

    const currentTime = moment().unix();
    const hasActiveAlert = isAlertActive(
      getCancelationsForRoute(route, patternId),
      [
        ...getServiceAlertsForRoute(route, patternId),
        ...getServiceAlertsForRouteStops(route, patternId),
      ],
      currentTime,
    );

    return (
      <div>
        <div className="header-for-printing">
          <h1>
            <FormattedMessage
              id="print-route-app-title"
              defaultMessage={config.title}
            />
            {` - `}
            <FormattedMessage id="route-guide" defaultMessage="Route guide" />
          </h1>
        </div>
        {route.type === 715 && <CallAgencyWarning route={route} />}
        <div className="tabs route-tabs">
          <nav
            className={cx('tabs-navigation', {
              'bp-large': breakpoint === 'large',
            })}
          >
            {breakpoint === 'large' && (
              <RouteNumber
                color={route.color ? `#${route.color}` : null}
                mode={route.mode}
                text={route.shortName}
                isRouteView
              />
            )}
            <a
              className={cx({ 'is-active': activeTab === Tab.Stops })}
              onClick={() => {
                this.changeTab(Tab.Stops);
              }}
            >
              <div>
                <Icon img="icon-icon_bus-stop" />
                <FormattedMessage id="stops" defaultMessage="Stops" />
              </div>
            </a>
            <a
              className={cx({ 'is-active': activeTab === Tab.Timetable })}
              onClick={() => {
                this.changeTab(Tab.Timetable);
              }}
            >
              <div>
                <Icon img="icon-icon_schedule" />
                <FormattedMessage id="timetable" defaultMessage="Timetable" />
              </div>
            </a>
            <a
              className={cx({
                activeAlert: hasActiveAlert,
                'is-active': activeTab === Tab.Disruptions,
              })}
              onClick={() => {
                this.changeTab(Tab.Disruptions);
              }}
            >
              <div>
                <Icon
                  img={hasActiveAlert ? 'icon-icon_caution' : 'icon-icon_info'}
                />
                <FormattedMessage
                  id="route-information"
                  defaultMessage="Route information"
                />
              </div>
            </a>
            <FavouriteRouteContainer
              className="route-page-header"
              gtfsId={route.gtfsId}
            />
          </nav>
          {patternId && !stopId && (
            <RoutePatternSelect
              params={params}
              validFrom={this.state.validFrom}
              route={route}
              onSelectChange={this.onPatternChange}
              gtfsId={route.gtfsId}
              activeTab={activeTab}
              className={cx({ 'bp-large': breakpoint === 'large' })}
            />
          )}
          <div className="row">
            <div className="columns small-9">
              <RouteAgencyInfo route={route} />
            </div>
            <div className="columns small-3 padding-vertical-normal">
              {stopId && (
                <div className="right">
                  <BackButton
                    defaultUrl={`/${PREFIX_TIMETABLE_SUMMARY}/${stopId}`}
                    color="#008bde"
                    text={<FormattedMessage id="back" defaultMessage="Back" />}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const containerComponent = Relay.createContainer(withBreakpoint(RoutePage), {
  fragments: {
    route: () =>
      Relay.QL`
      fragment on Route {
        gtfsId
        color
        shortName
        longName
        mode
        type
        ${RouteAgencyInfo.getFragment('route')}
        ${RoutePatternSelect.getFragment('route')}
        ${RouteAlertsQuery}
        agency {
          phone
        }
        patterns {
          headsign
          code
          stops {
            ${StopAlertsQuery}
          }
          trips: tripsForDate(serviceDay: $serviceDay) {
            stoptimes: stoptimesForDate(serviceDay: $serviceDay) {
              realtimeState
              scheduledArrival
              scheduledDeparture
              serviceDay
            }
          }
        }
      }
    `,
  },
  initialVariables: {
    serviceDay: moment().format(DATE_FORMAT),
  },
});

export { containerComponent as default, RoutePage as Component };
