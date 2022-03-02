import PropTypes from 'prop-types';
/* eslint-disable react/no-array-index-key */
import React, { Component } from 'react';
import cx from 'classnames';
import { Link } from 'react-router';
import { FormattedMessage } from 'react-intl';
import RouteNumber from '../RouteNumber';
import Icon from '../Icon';
import TimetableSummaryStopList from './TimetableSummaryStopList';
import {PREFIX_ROUTES, PREFIX_STOPS} from '../../util/path';
import { isPatternFullScreenForPrint } from '../../util/patternUtils';

class TimetableSummaryUrbanLineCard extends Component {
  static propTypes = {
    numberOfColumns: PropTypes.number.isRequired,
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
                id={`pattern-select-${selectedPattern.id}`}
                onChange={e => this.onChangePattern(e.target.value)}
                value={selectedPattern.id}
              >
                {patterns.map(pattern => (
                  <option key={`${pattern.id}`} value={pattern.id}>
                    {pattern.trip.tripLongName}
                  </option>
                ))}
              </select>
            </>
          ) : (
            <span>{patterns[0].trip.tripLongName}</span>
          )}
        </span>
        <span className="pattern-select-print-label">
          {selectedPattern.trip.tripLongName}
        </span>
      </>
    );
  }

  renderPatternTimeGroups(selectedPattern) {
    const { data, validFrom } = this.props;
    const { selectedGroup } = this.state;
    const patternTimesByGroup = data.find(
      d => d.pattern.id === selectedPattern.id,
    ).times;
    const weekdayGroups = selectedPattern.trip.tripTimesWeekdaysGroups.filter(
      group => patternTimesByGroup[group].hours.length > 0,
    );
    const selectedPatternGroup = selectedGroup || weekdayGroups[0];
    const key = `group-${selectedPattern.id}-${validFrom}`;
    return (
      <>
        {this.renderPatternTimeGroupTabs(
          key,
          weekdayGroups,
          selectedPatternGroup,
        )}
        {weekdayGroups.map(group => {
          return (
            <div
              key={`${key}-${group}`}
              className={cx('timetable-summary-urban-group', {
                selected: group === selectedPatternGroup,
              })}
            >
              {this.renderPatternTimeGroupLabel(group)}
              {this.renderPatternTimeGroup(
                selectedPattern,
                patternTimesByGroup[group],
              )}
              <br />
            </div>
          );
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
            <a
              key={`tab-${key}-${group}`}
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
      <div
        key={`group-row-hour-${selectedPattern.id}-${hour}`}
        className="timetable-summary-urban-group-row row"
      >
        <div className="columns timetable-summary-urban-group-hours">
          {hour}
        </div>
        <div className="columns timetable-summary-urban-group-minutes">
          {patternTimeGroup[hour].map(trip => (
            <span
              key={`group-row-hour-links-${selectedPattern.id}-${hour}-${trip.minutes}`}
            >
              <Link
                to={`/${PREFIX_ROUTES}/${trip.route.gtfsId}/${PREFIX_STOPS}/${trip.code}/${trip.gtfsId}?stopId=${this.props.stop.gtfsId}`}
              >
                {trip.minutes}
              </Link>
            </span>
          ))}
        </div>
      </div>
    ));
  }

  render() {
    const { data, numberOfColumns, stop, breakpoint, validFrom } = this.props;
    const { patterns, selectedPattern } = this.state;
    let columnCount = numberOfColumns;
    const output = [];
    patterns.forEach(pattern => {
      const patternTimesByGroup = data.find(d => d.pattern.id === pattern.id)
        .times;
      const isFirstCard = columnCount === 0;
      const isCurrentCardFullScreenForPrint = isPatternFullScreenForPrint(
        pattern,
        patternTimesByGroup,
      );
      const isPageFull = !isFirstCard && columnCount % 2 === 0;
      const shouldRenderPageBreak =
        (!isFirstCard && isCurrentCardFullScreenForPrint) || isPageFull;

      if (isCurrentCardFullScreenForPrint && columnCount % 2 === 1) {
        columnCount += 1;
      }

      columnCount += isCurrentCardFullScreenForPrint ? 2 : 1;

      if (shouldRenderPageBreak) {
        output.push(<div className="page-break" />);
      }

      output.push(
        <div
          key={`timetable-summary-urban-${pattern.id}}`}
          className={cx(
            'timetable-summary-urban columns large-4 medium-6 small-12',
            {
              selected: pattern.id === selectedPattern.id,
              'print-full-screen': isCurrentCardFullScreenForPrint,
              'after-page-break': shouldRenderPageBreak,
            },
          )}
        >
          <div className="row" style={{ position: 'relative' }}>
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
          {validFrom && (
            <div className="route-pattern-valid-from">
              <FormattedMessage
                id="valid-from"
                defaultMessage="(from {validFrom})"
                values={{ validFrom }}
              />
            </div>
          )}
          <div className="row padding-vertical-normal">
            <div className="columns small-6 timetable-summary-stop-list-container">
              {breakpoint === 'large' && (
                <TimetableSummaryStopList
                  currentStop={stop}
                  stops={pattern.stops}
                  route={pattern.route}
                />
              )}
            </div>
            <div
              className={cx(
                'columns',
                'timetable-summary-time-groups',
                breakpoint === 'large' ? 'small-6' : 'small-12',
              )}
            >
              {this.renderPatternTimeGroups(pattern)}
              {pattern.route.desc && (
                <div className="route-desc">
                  {pattern.route.desc.split('<br>').map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>,
      );
    });

    return output;
  }
}

export default TimetableSummaryUrbanLineCard;
