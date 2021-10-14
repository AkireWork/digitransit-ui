import PropTypes from 'prop-types';
/* eslint-disable react/no-array-index-key */
import React, { Component } from 'react';
import TimetableSummaryUrbanLineCard from './TimetableSummaryUrbanLineCard';

class TimetableSummaryUrbanLines extends Component {
  static propTypes = {
    stop: PropTypes.any.isRequired,
    patterns: PropTypes.any.isRequired,
    breakpoint: PropTypes.any.isRequired,
  };

  render() {
    const { stop, patterns, breakpoint } = this.props;
    const sortedPatterns = patterns.sort((a, b) => {
      const shortNameCompare = a.route.shortName.localeCompare(b.route.shortName);
      const stopTimesCountCompare = a.trip.stoptimesForWeek.length > b.trip.stoptimesForWeek.length ? -1 : 1;

      return shortNameCompare || stopTimesCountCompare;
    });
    const routes = {};
    sortedPatterns.forEach(pattern => {
      if (!routes[pattern.route.id]) {
        routes[pattern.route.id] = pattern.route;
      }
    });

    return (
      <div className="row no-padding no-margin timetable-summary-urban-cards">
        {Object.keys(routes).map(routeId => (
          <div className="columns large-4 medium-6 small-12" key={routeId}>
            <TimetableSummaryUrbanLineCard
              stop={stop}
              patterns={patterns.filter(
                pattern => pattern.route.id === routeId,
              )}
              breakpoint={breakpoint}
            />
          </div>
        ))}
      </div>
    );
  }
}

export default TimetableSummaryUrbanLines;