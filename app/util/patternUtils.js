import sum from 'lodash/sum';

export const PRINTOUT_COLUMN_ROW_COUNT_LIMIT = 50;

export const isPatternFullScreenForPrint = (pattern, patternTimesByGroup) => {
  const weekdayGroups = pattern.trip.tripTimesWeekdaysGroups.filter(group => patternTimesByGroup[group].hours.length > 0);
  let totalRowCount = 0;

  weekdayGroups.forEach(group => {
    const groupRowCount = 2 + patternTimesByGroup[group].hours.length + sum(patternTimesByGroup[group].hours
      .map(hour => patternTimesByGroup[group][hour].length > 6 ? 1 : 0));
    totalRowCount += groupRowCount;
  });

  if (pattern.route.desc) {
    totalRowCount += 3;
    pattern.route.desc.split('<br>').forEach(() => {
      totalRowCount += 3;
    });
  }

  return totalRowCount > PRINTOUT_COLUMN_ROW_COUNT_LIMIT;
};
