import PropTypes from 'prop-types';
/* eslint-disable react/no-array-index-key */
import React, { Component } from 'react';
import TimetableSummaryUrbanLineCard from './TimetableSummaryUrbanLineCard';
import connectToStores from "fluxible-addons-react/connectToStores";
import moment from "moment";
import SecondaryButton from "../SecondaryButton";

const WEEKDAYS = 'ETKNRLP';

class TimetableSummaryUrbanLines extends Component {
  static propTypes = {
    stop: PropTypes.any.isRequired,
    patterns: PropTypes.any.isRequired,
    breakpoint: PropTypes.any.isRequired,
    currentTime: PropTypes.any.isRequired,
  };

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

  compareValidFroms = (a, b) => {
    const { currentTime } = this.props;
    const aValidFrom = a.validFrom === 'CURRENT' ? currentTime : moment(a.validFrom, 'DD.MM.YYYY').unix();
    const bValidFrom = b.validFrom === 'CURRENT' ? currentTime : moment(b.validFrom, 'DD.MM.YYYY').unix();

    return aValidFrom - bValidFrom;
  };

  printItinerary = e => {
    e.stopPropagation();

    window.print();
  };

  render() {
    const { stop, patterns, breakpoint, currentTime } = this.props;
    const sortedPatterns = patterns.sort((a, b) => {
      const shortNameCompare = a.route.shortName.localeCompare(b.route.shortName);
      const stopTimesCountCompare = a.patternTimetable.length > b.patternTimetable.length ? -1 : 1;

      return shortNameCompare || stopTimesCountCompare;
    });

    const routesWithValidity = {};
    sortedPatterns.forEach(pattern => {
      // Add the route base object first when it doesn't exist
      if (!routesWithValidity[pattern.route.id] && pattern.patternTimetable.length > 0) {
        routesWithValidity[pattern.route.id] = {
          route: pattern.route,
          validPeriods: [],
        };
      }

      pattern.patternTimetable.forEach(timetable => {
        if (moment(timetable.validity.validTill, 'DD.MM.YYYY').isAfter(moment.unix(currentTime)) && moment(timetable.validity.validFrom, 'DD.MM.YYYY').isBefore(moment.unix(currentTime).add(14, 'days'))) {
          const isCurrent = moment(timetable.validity.validFrom, 'DD.MM.YYYY').isBefore(moment.unix(currentTime));
          const validFromLabel = isCurrent ? 'CURRENT' : timetable.validity.validFrom;

          let validityPeriod = routesWithValidity[pattern.route.id].validPeriods.find(period => period.validFrom === validFromLabel);
          if (!validityPeriod) {
            validityPeriod = {
              validFrom: validFromLabel,
              timetableData: [],
            };
            routesWithValidity[pattern.route.id].validPeriods.push(validityPeriod);
          }

          let timetableData = validityPeriod.timetableData.find(data => data.pattern.id === pattern.id);
          if (!timetableData) {
            let patternTimesByGroup = {};
            pattern.trip.tripTimesWeekdaysGroups
              .sort((a, b) => WEEKDAYS.indexOf(a.charAt(0)) - WEEKDAYS.indexOf(b.charAt(0)))
              .forEach(group => {
                patternTimesByGroup[group] = {
                  hours: [],
                };
              });

            timetableData = {
              pattern,
              times: patternTimesByGroup,
            };
            validityPeriod.timetableData.push(timetableData);
          }

          pattern.trip.tripTimesWeekdaysGroups.forEach(group => {
            if (this.weekdaysInGroup(timetable.weekdays, group)) {
              const departureTime = this.utcTime(timetable.times[0].scheduledDeparture);
              const departureHH = departureTime.format('HH');
              const departureMM = departureTime.format('mm');

              if (!timetableData.times[group][departureHH]) {
                timetableData.times[group][departureHH] = [];
                timetableData.times[group].hours.push(departureHH);
              }

              timetableData.times[group][departureHH].push({
                minutes: departureMM,
                route: {
                  gtfsId: pattern.route.gtfsId,
                },
                code: pattern.code,
                gtfsId: timetable.trip.gtfsId,
              });
            }
          });
        }
      });
    });

    return (
      <>
        <div className="print-button-container padding-vertical-small">
          <SecondaryButton
            ariaLabel="print"
            buttonName="print"
            buttonClickAction={e => this.printItinerary(e)}
            buttonIcon="icon-icon_print"
            smallSize
          />
        </div>
        <div className="row no-padding no-margin timetable-summary-urban-cards">
          {Object.keys(routesWithValidity)
            .map(routeId => routesWithValidity[routeId].validPeriods.sort((a, b) => this.compareValidFroms(a, b))
              .map(period => (
                <div className="columns large-4 medium-6 small-12" key={routeId + period.validFrom}>
                  <TimetableSummaryUrbanLineCard
                    stop={stop}
                    validFrom={period.validFrom !== 'CURRENT' && period.validFrom}
                    data={period.timetableData}
                    breakpoint={breakpoint}
                  />
                </div>
              )))}
        </div>
      </>
    );
  }
}

const connectedComponent = connectToStores(
  TimetableSummaryUrbanLines,
  ['TimeStore'],
  context => ({
    currentTime: moment('2021-08-28', 'YYYY-MM-DD').unix(),
    // context
    //   .getStore('TimeStore')
    //   .getCurrentTime()
    //   .unix(),
  }),
);

export {
  connectedComponent as default,
  TimetableSummaryUrbanLines as Component,
};
