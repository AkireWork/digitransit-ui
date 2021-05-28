FROM node:10
MAINTAINER Reittiopas version: 0.1

EXPOSE 8888

ENV \
  # Where the app is built and run inside the docker fs \
  WORK=/opt/digitransit-ui \
  # Used indirectly for saving npm logs etc. \
  HOME=/opt/digitransit-ui \
  # App specific settings to override when the image is run \
  SENTRY_DSN='' \
  SENTRY_SECRET_DSN='' \
  PORT=8888 \
  API_URL='' \
  MAP_URL='http://localhost:8090' \
  OTP_URL='http://localhost:8080/otp/routers/estonia/' \
  VEHICLE_URL='' \
  GEOCODING_BASE_URL='http://localhost:4000/v1' \
  APP_PATH='' \
  CONFIG='' \
  PIWIK_ADDRESS='' \
  PIWIK_ID='' \
  NODE_ENV='' \
  NODE_OPTS='' \
  RELAY_FETCH_TIMEOUT='' \
  ASSET_URL=''

WORKDIR ${WORK}
ADD . ${WORK}

RUN \
  npm install --silent && \
  npm add --force node-sass && \
  npm run build && \
  rm -rf static docs test /tmp/* && \
  npm cache clean --force

CMD npm run start
