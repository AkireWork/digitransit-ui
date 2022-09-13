import PropTypes from 'prop-types';
import React, { Component, useContext } from 'react';
import Relay from 'react-relay/classic';
import cx from 'classnames';
import { routerShape } from 'react-router';
import connectToStores from 'fluxible-addons-react/connectToStores';
import moment from 'moment';
import { orderBy } from 'lodash';
import { isSafari } from '../util/browser';

import Icon from './Icon';
import ComponentUsageExample from './ComponentUsageExample';
import {
  routePatterns as exampleRoutePatterns,
  twoRoutePatterns as exampleTwoRoutePatterns,
} from './ExampleData';
import { PREFIX_ROUTES } from '../util/path';

const DATE_FORMAT = 'YYYYMMDD';

class RoutePatternSelect extends Component {
  static propTypes = {
    params: PropTypes.object,
    className: PropTypes.string,
    route: PropTypes.object,
    onSelectChange: PropTypes.func.isRequired,
    serviceDay: PropTypes.string.isRequired,
    activeTab: PropTypes.string.isRequired,
    relay: PropTypes.object.isRequired,
    gtfsId: PropTypes.string.isRequired,
    validFrom: PropTypes.string,
  };

  validFrom = undefined;

  static contextTypes = {
    router: routerShape.isRequired,
  };

  constructor(props) {
    super(props);
    this.props.relay.setVariables({ serviceDay: this.props.serviceDay });
    this.state = {
      loading: false,
    };
  }

  componentWillMount = () => {
    const options = this.getOptions();
    if (options === null) {
      this.state = {
        loading: true,
      };
    }
  };

  getSafePatterns(patterns, serviceDay) {
    const thisDay = moment(serviceDay);
    const safePatterns = [];
    patterns.forEach(pattern => {
      if (pattern.patternTimetable) {
        let currentPresent = false;
        const timetables = pattern.patternTimetable.filter(timetable => {
          const validFrom = moment(timetable.validity.validFrom, 'DD.MM.YYYY');
          const validTill = moment(timetable.validity.validTill, 'DD.MM.YYYY');
          if (
            (validFrom.isBefore(thisDay) || validFrom.isSame(thisDay)) &&
            (validTill.isAfter(thisDay) || validTill.isSame(thisDay)) &&
            !currentPresent
          ) {
            currentPresent = true;
            return true;
          }
          if (
            validFrom.isAfter(thisDay) &&
            validFrom.diff(thisDay, 'days') < 15
          ) {
            return true;
          }
          return false;
        });
        if (timetables.length === 1 && pattern.patternTimetable.length === 1) {
          safePatterns.push(pattern);
        } else if (timetables.length >= 1) {
          let validFromList = pattern.patternTimetable.map(
            timetable => timetable.validity.validFrom,
          );
          validFromList = validFromList.filter(
            (n, i) => validFromList.indexOf(n) === i,
          );
          timetables.forEach(timetable => {
            if (
              validFromList.some(
                fromValue => fromValue === timetable.validity.validFrom,
              )
            ) {
              const copyPattern = Object.assign({}, pattern);
              copyPattern.patternTimetable = [timetable];
              safePatterns.push(copyPattern);
              validFromList = validFromList.filter(
                fromValue => fromValue !== timetable.validity.validFrom,
              );
            }
          });
        }
      } else {
        safePatterns.push(pattern);
      }
    });
    return safePatterns;
  }

  getOptions = () => {
    const {
      activeTab,
      gtfsId,
      params,
      route,
      serviceDay,
      validFrom,
    } = this.props;
    const { router } = this.context;

    let patterns = this.getSafePatterns(route.patterns, serviceDay);

    if (patterns.length === 0) {
      return null;
    }

    patterns = orderBy(
      patterns,
      ['code', 'patternTimetable[0].trip.gtfsId'],
      ['asc', 'asc'],
    );

    const options = patterns.map(pattern => {
      if (
        (activeTab === 'aikataulu' || activeTab === 'pysakit') &&
        pattern.patternTimetable &&
        pattern.patternTimetable.some(patterntimetable =>
          moment(patterntimetable.validity.validFrom, 'DD.MM.YYYY').isAfter(
            moment(serviceDay),
          ),
        )
      ) {
        return (
          <option
            key={pattern.code + pattern.patternTimetable[0].validity.validFrom}
            value={`${pattern.code} ${pattern.patternTimetable[0].validity.validFrom}`}
          >
            {`${pattern.trips[0].tripLongName} (${pattern.patternTimetable[0].validity.validFrom})`}
          </option>
        );
      }
      return (
        <option
          key={pattern.code + pattern.patternTimetable[0].validity.validFrom}
          value={`${pattern.code} `}
        >
          {`${pattern.trips[0].tripLongName}`}
        </option>
      );
    });

    if (
      options.every(
        o => o.key.substr(0, o.key.length - 10) !== params.patternId,
      )
    ) {
      router.replace(`/${PREFIX_ROUTES}/${gtfsId}/pysakit/${options[0].props.value.trim()}`);
    } else if (options.length > 0 && this.state.loading === true) {
      this.setState({ loading: false });
    }

    return options;
  };

  render() {
    const options = this.getOptions();
    const {
      validFrom,
    } = this.props;

    return this.state.loading === true ? (
      <div className={cx('route-pattern-select', this.props.className)} />
    ) : (
      <div
        className={cx('route-pattern-select', this.props.className, {
          hidden:
            this.props.route.patterns.find(
              o => o.tripsForDate && o.tripsForDate.length > 0,
            ) === undefined &&
            this.props.activeTab !== 'aikataulu' &&
            this.props.activeTab !== 'pysakit',
        })}
      >
        {options && (isSafari || options.length > 2 || options.length === 1) ? (
          <React.Fragment>
            <Icon img="icon-icon_arrow-dropdown" />
            <select
              id="select-route-pattern"
              onChange={e => this.props.onSelectChange(e.target.value)}
              value={
                this.props.params &&
                `${this.props.params.patternId} ${validFrom}`
              }
            >
              {options}
            </select>
          </React.Fragment>
        ) : (
          <div className="route-patterns-toggle">
            <div
              className="route-option"
              role="button"
              tabIndex={0}
              onKeyPress={() =>
                this.props.onSelectChange(
                  options.find(
                    o =>
                      o.props.value !==
                      `${this.props.params.patternId} ${validFrom}`,
                  ).props.value,
                )
              }
              onClick={() =>
                this.props.onSelectChange(
                  options.find(
                    o =>
                      o.props.value !==
                      `${this.props.params.patternId} ${validFrom}`,
                  ).props.value,
                )
              }
            >
              {options &&
                options.filter(
                  o =>
                    o.props.value ===
                    `${this.props.params.patternId} ${validFrom}`,
                )[0]}
            </div>

            <button
              type="button"
              className="toggle-direction"
              onClick={() =>
                this.props.onSelectChange(
                  options.find(
                    o =>
                      o.props.value !==
                      `${this.props.params.patternId} ${validFrom}`,
                  ).props.value,
                )
              }
            >
              <Icon img="icon-icon_direction-b" />
            </button>
          </div>
        )}
      </div>
    );
  }
}

const defaultProps = {
  activeTab: 'pysakit',
  className: 'bp-large',
  serviceDay: '20190306',
  relay: {
    setVariables: () => {},
  },
  params: {
    routeId: 'HSL:1010',
    patternId: 'HSL:1010:0:01',
  },
};

RoutePatternSelect.description = () => (
  <div>
    <p>Display a dropdown to select the pattern for a route</p>
    <ComponentUsageExample>
      <RoutePatternSelect route={exampleRoutePatterns} {...defaultProps} />
    </ComponentUsageExample>
    <ComponentUsageExample>
      <RoutePatternSelect route={exampleTwoRoutePatterns} {...defaultProps} />
    </ComponentUsageExample>
  </div>
);

const withStore = connectToStores(
  Relay.createContainer(RoutePatternSelect, {
    initialVariables: {
      serviceDay: moment().format(DATE_FORMAT),
      stopId: null,
    },
    fragments: {
      route: () => Relay.QL`
      fragment on Route {
        patterns {
          code
          headsign
          stops {
            name
          }
          route {
            longName
          }
          trips {
            gtfsId
            tripHeadsign
            tripLongName
          }
          
          patternTimetable (stopId: $stopId) {
            validity {
              validFrom
              validTill
            }
          }
          tripsForDate(serviceDay: $serviceDay) {
            id
            stoptimes: stoptimesForDate(serviceDay: $serviceDay) {
              scheduledArrival
              scheduledDeparture
              serviceDay
              stop {
                id
              }
            }
          }
        }
      }
      `,
    },
  }),
  [],
  context => ({
    serviceDay: context
      .getStore('TimeStore')
      .getCurrentTime()
      .format(DATE_FORMAT),
  }),
);

export { withStore as default, RoutePatternSelect as Component };
