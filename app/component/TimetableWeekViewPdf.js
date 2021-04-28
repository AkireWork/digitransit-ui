/* eslint-disable no-underscore-dangle */
import PropTypes from 'prop-types';
import React from 'react';
import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import moment from 'moment';

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
const formatTime = timestamp => moment(timestamp * 1000).format('HH:mm');

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
  },
  header: {
    marginBottom: 20,
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
  },
  col: {
    width: 80,
    borderLeft: '1px solid gray',
    textAlign: 'center',
  },
  headerCell: {
    borderTop: '1px solid black',
    borderBottom: '1px solid black',
    paddingTop: 2,
    paddingBottom: 1,
    paddingLeft: 10,
    paddingRight: 10,
  },
  cell: {
    height: 25,
    lineHeight: 1,
  },
});

function Table(props) {
  return <View style={styles.table} {...props} />;
}
function FirstColumn(props) {
  return <View style={styles.firstCol} {...props} />;
}
function Column(props) {
  return <View style={styles.col} {...props} />;
}
function HeaderCell(props) {
  return <Text style={styles.headerCell} {...props} />;
}
function TextCell(props) {
  return <Text style={styles.cell} {...props} />;
}

export default function TimetableWeekViewPdf({ patterns }) {
  const [
    hasDifferentArrivalDepartures,
    setHasDifferentArrivalDepartures,
  ] = React.useState(false);

  const renderTime = tripTime => {
    if (tripTime.scheduledDeparture === tripTime.scheduledArrival) {
      return formatTime(tripTime.scheduledDeparture);
    }
    if (!hasDifferentArrivalDepartures) {
      setHasDifferentArrivalDepartures(true);
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

  return (
    <Document>
      {patterns?.map(({ trip, __dataID__ }) => {
        const stoptimesChunks = chunkArray(trip.stoptimesForWeek, 5);

        return (
          // eslint-disable-next-line dot-notation
          <Page size="A4" style={styles.page} key={__dataID__}>
            <View style={styles.header}>
              <View style={{ flexDirection: 'row', marginBottom: '20px' }}>
                <Text style={{ margin: '20px', fontSize: '30px' }}>
                  {trip.route.shortName}
                </Text>
                <View style={{ display: 'grid', fontSize: '11px' }}>
                  <Text style={{ fontSize: '20px' }}>
                    {trip.route.longName}
                  </Text>
                  <Text>Vedaja: {trip.route.agency.name}</Text>
                  <Text>Korraldaja: {trip.route.competentAuthority}</Text>
                  <Text>Maakonnaliin (avalik)</Text>
                  <Text>
                    Sõiduplaan kehtib kuni:{' '}
                    {moment(trip.tripTimesValidTill).format('DD.MM.YYYY')}
                  </Text>
                </View>
              </View>
            </View>

            <Text>{trip.tripLongName}</Text>
            {stoptimesChunks.map((chunk, index) => {
              return (
                // eslint-disable-next-line react/no-array-index-key
                <Table wrap={false} key={index}>
                  <FirstColumn>
                    <HeaderCell>&nbsp;</HeaderCell>

                    <View style={{ marginTop: 5 }} />

                    {chunk[0].tripTimeByStopNameList.map(ch => (
                      <TextCell key={ch.__dataID__}>
                        {ch.stopName}
                        {ch.tripTimeShort.dropoffType ===
                          DROPOFF_TYPE_ENTER_ONLY && '\u00A0**'}
                        {ch.tripTimeShort.pickupType ===
                          PICKUP_TYPE_LEAVE_ONLY && '\u00A0*'}
                      </TextCell>
                    ))}
                  </FirstColumn>
                  {chunk.map(ch => {
                    return (
                      <Column key={ch.__dataID__}>
                        <Text style={styles.headerCell}>{ch.weekdays}</Text>

                        <View style={{ marginTop: 5 }} />

                        {ch.tripTimeByStopNameList.map(itm => (
                          <TextCell key={itm.__dataID__}>
                            {renderTime(itm.tripTimeShort)}
                          </TextCell>
                        ))}
                      </Column>
                    );
                  })}
                </Table>
              );
            })}

            {trip.stoptimesForWeek && (
              <React.Fragment>
                <View style={{ color: 'gray' }}>
                  <Text>ERIJUHUD:</Text>
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
                          {ex.dates
                            .map(date => moment(date).format('DD.MM.YYYY'))
                            .join(', ')}
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

            <View style={styles.footer} wrap={false}>
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
