/* eslint-disable no-underscore-dangle */
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import {
  Document,
  Page,
  pdf,
  StyleSheet,
  Text,
  View,
  Font,
} from '@react-pdf/renderer';
import { FormattedMessage } from 'react-intl';
import moment from 'moment';
import Icon from './Icon';

Font.register({
  family: 'Lato',
  src:
    'https://cdnjs.cloudflare.com/ajax/libs/lato-font/3.0.0/fonts/lato-normal/lato-normal.woff',
});

function chunkArray(array, size) {
  const chunkedArr = [];
  let index = 0;
  while (index < array.length) {
    chunkedArr.push(array.slice(index, size + index));
    index += size;
  }
  return chunkedArr;
}

const DROPOFF_TYPE_ENTER_ONLY = 'NONE';
const PICKUP_TYPE_LEAVE_ONLY = 'NONE';
const startOfDay = new Date().setHours(0, 0, 0, 0) / 1000;
const formatTime = timestamp =>
  moment(
    startOfDay + timestamp < 1e10
      ? (startOfDay + timestamp) * 1000
      : startOfDay + timestamp,
  ).format('HH:mm');

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Lato',
  },
  header: {
    marginBottom: 20,
  },
  subheader: {
    lineHeight: 1.3,
  },
  footer: {
    color: 'gray',
    position: 'absolute',
    bottom: 10,
    left: 20,
  },
  table: {
    marginTop: 2,
    marginBottom: 20,
    flexDirection: 'row',
  },
  row: {
    flexDirection: 'row',
  },
  firstCol: {
    width: 150,
    borderRight: '1px solid gray',
  },
  firstColBottom: {
    width: 150,
    borderRight: '1px solid gray',
    borderBottom: '1px solid gray',
  },
  col: {
    width: 50,
    borderRight: '1px solid gray',
    textAlign: 'center',
  },
  colBottom: {
    width: 50,
    borderRight: '1px solid gray',
    borderBottom: '1px solid gray',
    textAlign: 'center',
  },
  headerCell: {
    borderTop: '1px solid black',
    borderBottom: '1px solid black',
    textAlign: 'center',
    paddingTop: 2,
    paddingBottom: 1,
    paddingLeft: 10,
    paddingRight: 10,
  },
  cell: {
    height: 15,
    lineHeight: 1,
  },
  doubleCell: {
    height: 24,
    lineHeight: 1,
  },
});

function Table(props) {
  return <View style={styles.table} {...props} />;
}

function FirstColumn(props) {
  return props.last ? (
    <View style={styles.firstColBottom} {...props} />
  ) : (
    <View style={styles.firstCol} {...props} />
  );
}

function Column(props) {
  return props.last ? (
    <View style={styles.colBottom} {...props} />
  ) : (
    <View style={styles.col} {...props} />
  );
}

function HeaderCell(props) {
  return <Text style={styles.headerCell}>{props.children}</Text>;
}

const getStopName = itm => {
  let special = '';
  if (itm.tripTimeShort.dropoffType === DROPOFF_TYPE_ENTER_ONLY) {
    special = '\u00A0**';
  }
  if (itm.tripTimeShort.pickupType === PICKUP_TYPE_LEAVE_ONLY) {
    special = '\u00A0*';
  }
  return itm.stopName;
};

function TextCell(props) {
  return (
    <Text style={styles.cell}>
      {props.itm ? getStopName(props.itm) : props.children}
    </Text>
  );
}

function TextDoubleCell(props) {
  return (
    <>
      <View style={props.single ? { marginTop: 10 } : { marginTop: 5 }} />
      <Text style={styles.doubleCell}>
        {props.itm ? getStopName(props.itm) : props.children}
      </Text>
      <View style={!props.single ? { marginTop: 5 } : {}} />
    </>
  );
}

function TimetableWeekViewPdf({ patterns }) {
  let hasDifferentArrivalDepartures = false;

  const renderTime = tripTime => {
    if (tripTime.scheduledDeparture === tripTime.scheduledArrival) {
      return formatTime(tripTime.scheduledDeparture);
    }
    if (!hasDifferentArrivalDepartures) {
      hasDifferentArrivalDepartures = true;
    }

    return (
      // eslint-disable-next-line prefer-template
      formatTime(tripTime.scheduledArrival) +
      's' +
      '\u000A' +
      formatTime(tripTime.scheduledDeparture) +
      'v'
    );
  };

  const getIdxs = chunk => {
    const map = {};
    chunk.forEach(ch => {
      ch.tripTimesByWeekdaysList.forEach((tt, tti) => {
        tt.tripTimeByStopNameList.forEach((ttsnl, ttsnli) => {
          if (
            ttsnl.tripTimeShort.scheduledArrival !==
            ttsnl.tripTimeShort.scheduledDeparture
          ) {
            Array.isArray(map[tti])
              ? map[tti].push(ttsnli)
              : (map[tti] = [ttsnli]);
          }
        });
      });
    });
    return map;
  };

  const getTimetables = ptrns => {
    const timetables = [];
    // eslint-disable-next-line no-unused-expressions
    ptrns?.forEach(pattern => {
      const timetableStarts = [];
      // eslint-disable-next-line no-unused-expressions
      pattern.patternTimetable?.forEach((timetable, index, self) => {
        if (!timetableStarts.some(st => st === timetable.validity.validFrom)) {
          // eslint-disable-next-line no-param-reassign
          const tripsOnThisPattern = self.filter(tmtbl => tmtbl.validity.validFrom === timetable.validity.validFrom);
          const tripWeekdays = tripsOnThisPattern.map(tmtbl => tmtbl.weekdays);
          const tripStartTimes = tripsOnThisPattern.map(tmtbl => tmtbl.trip.departureStoptime.scheduledDeparture);

          // eslint-disable-next-line no-param-reassign
          timetable.trip.stoptimesForWeek = timetable.trip.stoptimesForWeek.filter(stoptime => tripStartTimes.some(starttime => starttime === stoptime.calendarDatesByFirstStoptime.time))
          timetable.trip.stoptimesForWeek.forEach((stopTime, indx) => (stopTime.weekdays = tripWeekdays[indx]));

          timetables.push(timetable);
          timetableStarts.push(timetable.validity.validFrom);
        }
      });
    });
    return timetables;
  };

  return (
    <Document>
      {getTimetables(patterns)?.map(({ trip, validity, __dataID__ }, i) => {
        const stoptimesChunks = chunkArray(trip.stoptimesForWeek, 7);

        return (
          // eslint-disable-next-line dot-notation
          <Page size="A4" style={styles.page} key={__dataID__}>
            <View style={styles.header}>
              <View style={{ flexDirection: 'row', marginBottom: '20px' }}>
                <Text
                  style={{
                    margin: '20px',
                    marginBottom: '25px',
                    fontSize: '25px',
                  }}
                >
                  {trip.route.shortName}
                </Text>
                <View style={{ display: 'grid', fontSize: '10px' }}>
                  <Text style={{ fontSize: '15px' }}>
                    {trip.route.longName}
                  </Text>
                  <Text style={styles.subheader}>
                    {trip.serviceOperatorLabel} {trip.route.agency.name}
                  </Text>
                  <Text style={styles.subheader}>
                    {trip.serviceManagerLabel} {trip.route.competentAuthority}
                  </Text>
                  <Text style={styles.subheader}>{trip.routeTypeLabel}</Text>
                  {true && (
                    <Text style={styles.subheader}>
                      {trip.routeValidFromLabel} {validity.validFrom}
                    </Text>
                  )}
                  <Text style={styles.subheader}>
                    {trip.routeValidTillLabel} {validity.validTill}
                  </Text>
                </View>
              </View>
            </View>

            <Text>{trip.tripLongName}</Text>
            {stoptimesChunks.map(
              (chunk, index) =>
                trip.stoptimesForWeek &&
                trip.stoptimesForWeek[0].tripTimesByWeekdaysList.map(
                  (ttt, tttidx, list) => {
                    const idxs = getIdxs(chunk);
                    return (
                      // eslint-disable-next-line react/no-array-index-key
                      <Table wrap={false} key={chunk.__dataID__}>
                        <FirstColumn last={tttidx === list.length - 1}>
                          <HeaderCell>&nbsp;</HeaderCell>

                          <View style={{ marginTop: 5 }} />

                          {chunk[0].tripTimesByWeekdaysList[
                            tttidx
                          ].tripTimeByStopNameList.map((itm, itmi) =>
                            // eslint-disable-next-line no-prototype-builtins
                            idxs.hasOwnProperty(tttidx) &&
                            idxs[tttidx].includes(itmi) ? (
                              <View style={{ height: 24 }}>
                                <Text style={{ lineHeight: 1 }}>
                                  {itm.stopName}
                                  {itm.tripTimeShort.dropoffType ===
                                    DROPOFF_TYPE_ENTER_ONLY && '\u00A0**'}
                                  {itm.tripTimeShort.pickupType ===
                                    PICKUP_TYPE_LEAVE_ONLY && '\u00A0*'}
                                </Text>
                              </View>
                            ) : (
                              <View style={{ height: 15 }}>
                                <Text style={{ lineHeight: 1 }}>
                                  {itm.stopName}
                                  {itm.tripTimeShort.dropoffType ===
                                    DROPOFF_TYPE_ENTER_ONLY && '\u00A0**'}
                                  {itm.tripTimeShort.pickupType ===
                                    PICKUP_TYPE_LEAVE_ONLY && '\u00A0*'}
                                </Text>
                              </View>
                            ),
                          )}
                        </FirstColumn>
                        {chunk.map(ch => {
                          return (
                            <Column
                              last={tttidx === list.length - 1}
                              key={ch.__dataID__}
                            >
                              <Text style={styles.headerCell}>
                                {ch.weekdays}
                              </Text>

                              <View style={{ marginTop: 5 }} />

                              {ch.tripTimesByWeekdaysList[
                                tttidx
                              ].tripTimeByStopNameList.map((itm, itmi) =>
                                // eslint-disable-next-line no-prototype-builtins
                                idxs.hasOwnProperty(tttidx) &&
                                idxs[tttidx].includes(itmi) ? (
                                  <View style={{ height: 24 }}>
                                    <Text style={{ lineHeight: 1 }}>
                                      {renderTime(itm.tripTimeShort)}
                                    </Text>
                                  </View>
                                ) : (
                                  <View style={{ height: 15 }}>
                                    <Text style={{ lineHeight: 1 }}>
                                      {renderTime(itm.tripTimeShort)}
                                    </Text>
                                  </View>
                                ),
                              )}
                            </Column>
                          );
                        })}
                      </Table>
                    );
                  },
                ),
            )}

            {trip.stoptimesForWeek.find(
              stoptimes =>
                stoptimes.calendarDatesByFirstStoptime.calendarDateExceptions
                  .length > 0,
            ) && (
              <React.Fragment>
                <View style={{ color: 'gray' }}>
                  <Text>ERIJUHUD (Järgmised 30 päeva):</Text>
                </View>
                {trip.stoptimesForWeek.map(stoptimes =>
                  stoptimes.calendarDatesByFirstStoptime.calendarDateExceptions.map(
                    ex => (
                      <View
                        key={ex.__dataID__}
                        style={{ color: 'gray' }}
                        wrap={false}
                      >
                        <Text>
                          {formatTime(
                            stoptimes.calendarDatesByFirstStoptime.time,
                          )}
                          {ex.exceptionType === 1
                            ? ' väljub ka '
                            : ' ei välju '}
                          {ex.dates.join(', ')}
                        </Text>
                      </View>
                    ),
                  ),
                )}
              </React.Fragment>
            )}

            {hasDifferentArrivalDepartures && (
              <View style={{ color: 'gray' }} wrap={false}>
                <Text>s peatusesse saabumise kellaaeg</Text>
                <Text>v peatusest väljumise kellaaeg</Text>
              </View>
            )}

            <View fixed style={styles.footer} wrap={false}>
              <Text>* ainult väljumiseks</Text>
              <Text>** ainult sisenemiseks</Text>
            </View>
          </Page>
        );
      })}
    </Document>
  );
}

TimetableWeekViewPdf.propTypes = {
  patterns: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default function PDFButton(props) {
  const [isGenerating, setIsGenerating] = useState(false);

  const renderPDF = () => {
    setIsGenerating(true);

    setTimeout(() => {
      const docBlob = pdf(TimetableWeekViewPdf(props)).toBlob();

      docBlob
        .then(blob => {
          // create a blobURI pointing to our Blob
          const blobUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = blobUrl;
          link.onclick = () => {
            window.open(blobUrl);
            return false;
          };
          // some browser needs the anchor to be in the doc
          document.body.append(link);
          link.click();
          link.remove();
          // in case the Blob uses a lot of memory
          // setTimeout(() => URL.revokeObjectURL(blobUrl), 7000);
        })
        .catch(err => {
          // TODO: show error result
          console.error(err);
          alert('couldnt generate your pdf, please try again later');
        })
        .finally(() => {
          setIsGenerating(false);
        });
    }, 50);
  };

  return (
    <button
      className="secondary-button small"
      style={{
        fontSize: '0.8125rem',
        textDecoration: 'none',
        marginBottom: '0.7em',
        marginLeft: 'auto',
        marginRight: '0.7em',
        display: 'flex !important',
      }}
      disabled={isGenerating}
      onClick={renderPDF}
    >
      <Icon img="icon-icon_print" />
      {isGenerating ? (
        <FormattedMessage id="loading" defaultMessage="Loading..." />
      ) : (
        <FormattedMessage
          id="print-timetable-plan"
          defaultMessage="Koondplaan"
        />
      )}
    </button>
  );
}
