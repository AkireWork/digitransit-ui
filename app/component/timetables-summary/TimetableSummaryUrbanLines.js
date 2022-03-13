import PropTypes from 'prop-types';
/* eslint-disable react/no-array-index-key */
import React, { Component } from 'react';
import connectToStores from 'fluxible-addons-react/connectToStores';
import moment from 'moment';
import TimetableSummaryUrbanLineCard from './TimetableSummaryUrbanLineCard';
import SecondaryButton from '../SecondaryButton';
import { isPatternFullScreenForPrint } from '../../util/patternUtils';

const WEEKDAYS = 'ETKNRLP';

class TimetableSummaryUrbanLines extends Component {
  static propTypes = {
    stop: PropTypes.any.isRequired,
    patterns: PropTypes.any.isRequired,
    breakpoint: PropTypes.any.isRequired,
    currentTime: PropTypes.any.isRequired,
  };

  constructor(props) {
    super(props);
    const { patterns, currentTime } = props;
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
            const patternTimesByGroup = {};
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
              timetable.times.forEach((time, index) => {
                const departureTime = this.utcTime(time.scheduledDeparture);
                const departureHH = departureTime.format('HH');
                const departureMM = departureTime.format('mm');

                if (!timetableData.times[group][departureHH]) {
                  timetableData.times[group][departureHH] = [];
                  timetableData.times[group].hours.push(departureHH);
                }

                timetableData.times[group][departureHH].push({
                  minutes: departureMM,
                  stopIndex: index,
                  route: {
                    gtfsId: pattern.route.gtfsId,
                  },
                  code: pattern.code,
                  gtfsId: timetable.trip.gtfsId,
                });
              });
            }
          });
        }
      });
    });

    Object.keys(routesWithValidity).forEach(routeId => {
      routesWithValidity[routeId].validPeriods = routesWithValidity[routeId].validPeriods
        .sort((a, b) => this.compareValidFroms(a, b));
    });

    this.state = {
      routesWithValidity,
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

  compareValidFroms = (a, b) => {
    const { currentTime } = this.props;
    const aValidFrom =
      a.validFrom === 'CURRENT'
        ? currentTime
        : moment(a.validFrom, 'DD.MM.YYYY').unix();
    const bValidFrom =
      b.validFrom === 'CURRENT'
        ? currentTime
        : moment(b.validFrom, 'DD.MM.YYYY').unix();

    return aValidFrom - bValidFrom;
  };

  printItinerary = e => {
    e.stopPropagation();

    window.print();
  };

  render() {
    const { stop, breakpoint } = this.props;
    const { routesWithValidity } = this.state;
    let numberOfColumns = 0;
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
          {Object.keys(routesWithValidity).map((routeId, routeIndex) =>
            routesWithValidity[routeId].validPeriods.map(period => {
              const card = (
                <TimetableSummaryUrbanLineCard
                  numberOfColumns={numberOfColumns}
                  key={`urban-card-${routeIndex}-${period.validFrom}`}
                  stop={stop}
                  validFrom={period.validFrom !== 'CURRENT' && period.validFrom}
                  data={period.timetableData}
                  breakpoint={breakpoint}
                />
              );

              period.timetableData.forEach(data => {
                const isFullScreenForPrint = isPatternFullScreenForPrint(
                  data.pattern,
                  data.times,
                );
                if (isFullScreenForPrint && numberOfColumns % 2 === 1) {
                  numberOfColumns += 1;
                }
                numberOfColumns += isFullScreenForPrint ? 2 : 1;
              });

              return card;
            }),
          )}
        </div>
      </>
    );
  }
}

const connectedComponent = connectToStores(
  TimetableSummaryUrbanLines,
  ['TimeStore'],
  context => ({
    currentTime: context
      .getStore('TimeStore')
      .getCurrentTime()
      .unix(),
  }),
);

export {
  connectedComponent as default,
  TimetableSummaryUrbanLines as Component,
};
