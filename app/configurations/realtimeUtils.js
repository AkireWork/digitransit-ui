/* eslint-disable prefer-template */

function defaultRouteSelector(routePageProps) {
  const route = routePageProps.route.gtfsId.split(':');
  return route[1];
}

const est = {
  mqttTopicResolver: function mqttTopicResolver(route) {
    return '/hfp/v1/journey/ongoing/+/+/+/' + route + '/#';
  },
  mqtt: process.env.VEHICLES_URL || 'wss://mqtt.dev.peatus.ee/',
  // mqtt: process.env.VEHICLES_URL || 'ws://localhost:1884/',
  routeSelector: defaultRouteSelector,
  active: true,
  agency: 'TALLINN TA',
};

export default {
  estonia: est,
  elron: { ...est, agency: 'ELRON' },
};
// tampere: {
//   mqttTopicResolver: walttiTopicResolver,
//
//   mqtt: 'wss://mqtt.lmj.fi/mqtt',
//
//   credentials: { username: 'user', password: 'userpass' },
//
//   gtfsrt: true,
//
//   routeSelector: defaultRouteSelector,
//
//   active: true,
// },
