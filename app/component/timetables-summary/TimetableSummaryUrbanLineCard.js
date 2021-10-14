import PropTypes from 'prop-types';
/* eslint-disable react/no-array-index-key */
import React, {Component} from 'react';
import RouteNumber from "../RouteNumber";
import Icon from "../Icon";
import TimetableSummaryStopList from "./TimetableSummaryStopList";
import cx from "classnames";
import moment from "moment";
import {FormattedMessage} from "react-intl";

const WEEKDAYS = 'ETKNRLP';

class TimetableSummaryUrbanLineCard extends Component {

  static propTypes = {
    stop: PropTypes.any.isRequired,
    patterns: PropTypes.any.isRequired,
    breakpoint: PropTypes.any.isRequired,
  };

  constructor(props, context) {
    super(props, context);
    // Required as it is not passed upwards through the whole inherittance chain
    this.context = context;
    this.state = {
      selectedPattern: props.patterns && props.patterns[0],
    };
  }

  utcTime = timestamp => {
    return moment(timestamp * 1000).utc();
  };

  splitWeekdays = weekdays => {
    if (weekdays.indexOf('-') > -1) {
      const start = WEEKDAYS.indexOf(weekdays[0]);
      const end = WEEKDAYS.indexOf(weekdays[2]);
      const weekdaysArray = [];
      for (let i = start; i <= end; i++) {
        weekdaysArray.push(WEEKDAYS[i]);
      }
      weekdays = weekdaysArray.join(',');
    }

    return weekdays;
  };

  weekdaysInGroup = (weekdays, group) => {
    return this.splitWeekdays(weekdays).includes(this.splitWeekdays(group));
  };

  onChangePattern = patternId => {
    this.setState({
      selectedPattern: this.props.patterns.find(
        pattern => pattern.id === patternId,
      ),
    });
  };

  groupPatternTimesIntoGroupsByHour = (selectedPattern) => {
    const patternTimesByGroup = {};
    selectedPattern.trip.tripTimesWeekdaysGroups
      .sort((a, b) => WEEKDAYS.indexOf(a.charAt(0)) - WEEKDAYS.indexOf(b.charAt(0)))
      .forEach(group => {
        patternTimesByGroup[group] = {
          hours: [],
        };
      });

    selectedPattern.trip.stoptimesForWeek.forEach(stopTimes => {
      selectedPattern.trip.tripTimesWeekdaysGroups.forEach(group => {
        if (this.weekdaysInGroup(stopTimes.weekdays, group)) {
          const departureTime = this.utcTime(stopTimes.tripTimesByWeekdaysList[0].tripTimeByStopNameList[0]
            .tripTimeShort.scheduledDeparture);
          const departureHH = departureTime.format('HH');
          const departureMM = departureTime.format('mm');

          if (!patternTimesByGroup[group][departureHH]) {
            patternTimesByGroup[group][departureHH] = [];
            patternTimesByGroup[group].hours.push(departureHH);
          }
          patternTimesByGroup[group][departureHH].push(departureMM); // + ' (' + stopTimes.validity.validFrom + ')');
        }
      });
    });

    return patternTimesByGroup;
  };

  renderPatternSelect() {
    const { patterns } = this.props;
    const { selectedPattern: { route } } = this.state;

    return (
      <>
        {patterns.length > 1 ? (
          <>
            <Icon img="icon-icon_arrow-dropdown" />
            <select
              id={`pattern-select-${route.id}`}
              onChange={e => this.onChangePattern(e.target.value)}
            >
              {patterns.map(pattern => (
                <option key={`${pattern.id}`} value={pattern.id}>{pattern.trip.tripLongName}</option>
              ))}
            </select>
          </>
        ) : (
          <span>{patterns[0].trip.tripLongName}</span>
        )}
      </>
    );
  }

  renderPatternTimeGroups() {
    const { selectedPattern, selectedGroup } = this.state;
    const patternTimesByGroup = this.groupPatternTimesIntoGroupsByHour(selectedPattern);
    const selectedPatternGroup = selectedGroup || Object.keys(patternTimesByGroup)[0];
    const tripTimes = patternTimesByGroup[selectedPatternGroup];

    return (
      <div key={`${selectedPattern.id}-${selectedGroup}`} className="timetable-summary-urban-group">
        {Object.keys(patternTimesByGroup).length > 1 ? this.renderPatternTimeGroupTabs() : <h3>{selectedGroup}</h3>}
        {this.renderPatternTimeGroup(selectedPattern, tripTimes)}
        <br/>
      </div>
    );
  }

  renderPatternTimeGroupTabs() {
    const { selectedPattern, selectedGroup } = this.state;
    const selectedPatternGroup = selectedGroup || selectedPattern.trip.tripTimesWeekdaysGroups[0];
    return (
      <div className="tabs group-tabs">
        <nav className="tabs-navigation">
          {selectedPattern.trip.tripTimesWeekdaysGroups.map(group => (
            <a
              className={cx({
                'is-active': group === selectedPatternGroup,
              })}
              onClick={() => {
                this.openGroupTab(group);
              }}
            >
              <span>{group}</span>
            </a>
          ))}
        </nav>
      </div>
    );
  }

  openGroupTab(group) {
    this.setState({
      selectedGroup: group,
    });
  }

  renderPatternTimeGroup(selectedPattern, patternTimeGroup) {
    return patternTimeGroup.hours.map(hour => (
      <div key={`${selectedPattern.id}-${hour}`} className="timetable-summary-urban-group-row row">
        <div className="columns timetable-summary-urban-group-hours">{hour}</div>
        <div className="columns timetable-summary-urban-group-minutes">
          {patternTimeGroup[hour].map(minutes => (
            <span key={`${selectedPattern.id}-${hour}-${minutes}`}>{minutes}</span>
          ))}
        </div>
      </div>
    ));
  }

  render() {
    const { stop, breakpoint } = this.props;
    const { selectedPattern, selectedPattern: { route } } = this.state;

    return (
      <div className="timetable-summary-urban">
        <div className="row padding-vertical-normal" style={{position: 'relative'}}>
          <div className="columns large-6 timetable-summary-route-number">
            <RouteNumber
              color={route.color ? `#${route.color}` : null}
              mode={route.mode}
              text={route.shortName}
            />
          </div>
          <div className="route-pattern-select columns large-6 medium-12">
            {this.renderPatternSelect()}
          </div>
        </div>
        <div className="row padding-vertical-normal">
          <div className="columns small-6">
            {breakpoint === 'large' &&
              <TimetableSummaryStopList
                currentStop={stop}
                stops={selectedPattern.stops}
                route={route}
              />
            }
          </div>
          <div className={cx('columns', breakpoint === 'large' ? 'small-6' : 'small-12')}>
            {this.renderPatternTimeGroups()}
            {route.desc && route.desc.split('<br>').map((line, index) => <p key={index}>{line}</p>)}
          </div>
        </div>
      </div>
    );
  }
}

export default TimetableSummaryUrbanLineCard;