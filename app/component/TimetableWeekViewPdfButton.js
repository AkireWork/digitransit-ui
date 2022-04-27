import { FormattedMessage, intlShape } from 'react-intl';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { pdf } from '@react-pdf/renderer';
import moment from 'moment';
import TimetableWeekViewPdf from './TimetableWeekViewPdf';

const DATE_FORMAT = 'YYYYMMDD';

const RouteTypeLine = color => {
  switch (color) {
    case 'ff711d':
      return 'route-type-train';
    case 'de2c42':
      return 'route-type-city-line-bus';
    case '016e12':
      return 'route-type-city-line-tram';
    case '1ccc48':
      return 'route-type-city-line-trolley';
    case 'bd4819':
      return 'route-type-city-line-commercial';
    case '3bb5db':
      return 'route-type-regional-line-pso';
    case '094f82':
      return 'route-type-regional-line-commercial';
    case '660000':
      return 'route-type-long-distance-bus-line';
    case '8bb4c5':
      return 'route-type-ferry';
    default:
      return '';
  }
};

class TimetableWeekViewPdfButton extends React.Component {
  static propTypes = {
    pattern: PropTypes.object.isRequired,
  };

  static contextTypes = {
    config: PropTypes.object.isRequired,
  };

  injectTranslationsForPdf = patterns => {
    return patterns.map(pattern => {
      pattern.patternTimetable.forEach(timetable => {
        // eslint-disable-next-line no-param-reassign
        timetable.trip.serviceOperatorLabel = this.context.intl.formatMessage({
          id: 'service-operator',
          defaultMessage: 'Operator:',
        });
        // eslint-disable-next-line no-param-reassign
        timetable.trip.serviceManagerLabel = this.context.intl.formatMessage({
          id: 'service-manager',
          defaultMessage: 'Manager:',
        });
        // eslint-disable-next-line no-param-reassign
        timetable.trip.routeTypeLabel = this.context.intl.formatMessage({
          id: RouteTypeLine(timetable.trip.route.color),
          defaultMessage: 'Regional line (Commercial)',
        });
        // eslint-disable-next-line no-param-reassign
        timetable.trip.routeValidFromLabel = this.context.intl.formatMessage({
          id: 'timetable-valid-from',
          defaultMessage: 'The timetable is valid from:',
        });
        // eslint-disable-next-line no-param-reassign
        timetable.trip.routeValidTillLabel = this.context.intl.formatMessage({
          id: 'timetable-valid-till',
          defaultMessage: 'The timetable is valid until:',
        });
      });
      return pattern;
    });
  };

  render() {

    const someData = useFragment

    const [isGenerating, setIsGenerating] = useState(false);
    setIsGenerating(true);

    const renderPDF = () => {
      setIsGenerating(true);

      setTimeout(() => {
        const docBlob = pdf(
          TimetableWeekViewPdf(
            this.injectTranslationsForPdf(this.props.pattern.route.patterns),
          ),
        ).toBlob();

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
}

const connectedComponent = Relay.createContainer(TimetableWeekViewPdfButton, {
  initialVariables: {
    stopId: null,
    serviceDate: null,
  },
  fragments: {
    pattern: () => Relay.QL`
      fragment on Pattern {
    stops {
      id
      name
    }
    route {
      url
      gtfsId
      shortName
      color
      longName
      patterns {
        stops {
          name
        }
        patternTimetable (stopId: $stopId) {
          validity {
            validFrom
            validTill
          }
          weekdays
          trip {
            id
            gtfsId
            tripLongName
            wheelchairAccessible
            tripTimesWeekdaysGroups
            tripTimesValidTill
            departureStoptime (serviceDate: $serviceDate) {
              scheduledDeparture
            }
            route {
              color
              shortName
              longName
              agency {
                name
              }
              competentAuthority
            }
            stoptimesForWeek {
              parts
              weekdays
              calendarDatesByFirstStoptime {
                time
                calendarDateExceptions {
                  exceptionType
                  dates
                }
              }
              tripTimesByWeekdaysList {
                tripTimeByStopNameList {
                  stopName
                  differentDeparture
                  tripTimeShort {
                    headsign
                    realtimeState
                    scheduledArrival
                    scheduledDeparture
                    serviceDay
                    pickupType
                    dropoffType
                  }
                }
              }
            }
          }
        }
      }
    }
  }
    `,
  },
});

export {
  connectedComponent as default,
  TimetableWeekViewPdfButton as Component,
};
