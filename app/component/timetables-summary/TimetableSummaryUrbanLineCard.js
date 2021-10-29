import PropTypes from 'prop-types';
/* eslint-disable react/no-array-index-key */
import React, {Component} from 'react';
import RouteNumber from "../RouteNumber";
import Icon from "../Icon";
import TimetableSummaryStopList from "./TimetableSummaryStopList";
import cx from "classnames";
import {Link} from "react-router";
import {PREFIX_ROUTES} from "../../util/path";
import {FormattedMessage} from "react-intl";
import sum from "lodash/sum";

const PRINTOUT_COLUMN_ROW_COUNT_LIMIT = 55;

class TimetableSummaryUrbanLineCard extends Component {

  static propTypes = {
    stop: PropTypes.any.isRequired,
    validFrom: PropTypes.any,
    data: PropTypes.any.isRequired,
    breakpoint: PropTypes.any.isRequired,
  };

  constructor(props, context) {
    super(props, context);
    // Required as it is not passed upwards through the whole inherittance chain
    this.context = context;
    const patterns = props.data.map(d => d.pattern);
    this.state = {
      patterns,
      selectedPattern: patterns && patterns[0],
    };
  }

  onChangePattern = patternId => {
    this.setState({
      selectedPattern: this.state.patterns.find(
        pattern => pattern.id === patternId,
      ),
      selectedGroup: undefined,
    });
  };

  renderPatternSelect(selectedPattern) {
    const { patterns } = this.state;

    return (
      <>
        <span className="pattern-select-label">
          {patterns.length > 1 ? (
            <>
              <Icon img="icon-icon_arrow-dropdown" />
              <select
                id={`pattern-select-${selectedPattern.route.id}`}
                onChange={e => this.onChangePattern(e.target.value)}
                value={selectedPattern.id}
              >
                {patterns.map(pattern => (
                  <option key={`${pattern.id}`} value={pattern.id}>{pattern.trip.tripLongName}</option>
                ))}
              </select>
            </>
          ) : (
            <span>{patterns[0].trip.tripLongName}</span>
          )}
        </span>
        <span className="pattern-select-print-label">{selectedPattern.trip.tripLongName}</span>
      </>
    );
  }

  renderPatternTimeGroups(selectedPattern) {
    const { data, validFrom } = this.props;
    const { selectedGroup } = this.state;
    const patternTimesByGroup = data.find(d => d.pattern.id === selectedPattern.id).times;
    const weekdayGroups = selectedPattern.trip.tripTimesWeekdaysGroups.filter(group => patternTimesByGroup[group].hours.length > 0);
    const selectedPatternGroup = selectedGroup || weekdayGroups[0];
    const key = `${selectedPattern.id}-${validFrom}`;
    let totalRowCount = 0;
    return (
      <>
        {this.renderPatternTimeGroupTabs(key, weekdayGroups, selectedPatternGroup)}
        {weekdayGroups.map(group => {
          let hasAdditionalMargin = false;
          let groupRowCount = 2 + patternTimesByGroup[group].hours.length + sum(patternTimesByGroup[group].hours.map(hour => patternTimesByGroup[group][hour].length > 6 ? 1 : 0));
          totalRowCount += groupRowCount;
          if (totalRowCount > PRINTOUT_COLUMN_ROW_COUNT_LIMIT) {
            hasAdditionalMargin = true;
            totalRowCount = groupRowCount;
          }
          return (
            <div key={key} className={cx('timetable-summary-urban-group', {'selected': group === selectedPatternGroup}, {'with-additional-margin': hasAdditionalMargin})}>
              {this.renderPatternTimeGroupLabel(group)}
              {this.renderPatternTimeGroup(selectedPattern, patternTimesByGroup[group])}
              <br />
            </div>
          )
        })}
      </>
    );
  }

  renderPatternTimeGroupLabel(selectedPatternGroup) {
    return (
      <div className="timetable-summary-urban-group-label">
        <span>{selectedPatternGroup}</span>
      </div>
    );
  }

  renderPatternTimeGroupTabs(key, weekdayGroups, selectedPatternGroup) {
    return (
      <div className="tabs group-tabs">
        <nav className="tabs-navigation">
          {weekdayGroups.map(group => (
            <a key={`${key}-${group}`}
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
          {patternTimeGroup[hour].map(trip => (
            <span>
              <Link to={`/${PREFIX_ROUTES}/${trip.route.gtfsId}/pysakit/${trip.code}/${trip.gtfsId}/${this.props.stop.gtfsId}`}
                    key={`${selectedPattern.id}-${hour}-${trip.minutes}`}>{trip.minutes}</Link>
            </span>
          ))}
        </div>
      </div>
    ));
  }

  render() {
    const { stop, breakpoint, validFrom } = this.props;
    const { patterns, selectedPattern } = this.state;

    return patterns.map(pattern => (
      <div className={cx('timetable-summary-urban', { selected: pattern.id === selectedPattern.id})}>
        <div className="row padding-vertical-normal" style={{position: 'relative'}}>
          <div className="columns large-6 timetable-summary-route-number">
            <RouteNumber
              color={pattern.route.color ? `#${pattern.route.color}` : null}
              mode={pattern.route.mode}
              text={pattern.route.shortName}
            />
          </div>
          <div className="route-pattern-select columns large-6 medium-12">
            {this.renderPatternSelect(pattern)}
          </div>
        </div>
        {validFrom && <div className="route-pattern-valid-from">
          <FormattedMessage id="valid-from" defaultMessage="(from {validFrom})"
                            values={{ validFrom }} />
        </div>}
        <div className="row padding-vertical-normal">
          <div className="columns small-6 timetable-summary-stop-list-container">
            {breakpoint === 'large' &&
              <TimetableSummaryStopList
                currentStop={stop}
                stops={pattern.stops}
                route={pattern.route}
              />
            }
          </div>
          <div className={cx('columns', 'timetable-summary-time-groups', breakpoint === 'large' ? 'small-6' : 'small-12')}>
            {this.renderPatternTimeGroups(pattern)}
            {pattern.route.desc &&
              <div>{pattern.route.desc.split('<br>').map((line, index) => <p key={index}>{line}</p>)}</div>
            }
          </div>
        </div>
      </div>
    ));
  }
}

export default TimetableSummaryUrbanLineCard;