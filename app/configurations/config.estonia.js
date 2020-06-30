const CONFIG = 'estonia';
const API_URL = process.env.API_URL || 'https://dev-api.digitransit.fi';
const GEOCODING_BASE_URL =
  process.env.GEOCODING_BASE_URL || `${API_URL}/geocoding/v1`;
const MAP_URL =
  process.env.MAP_URL || 'https://digitransit-dev-cdn-origin.azureedge.net';
const APP_PATH = process.env.APP_CONTEXT || '';
const { SENTRY_DSN } = process.env;
const PORT = process.env.PORT || 8080;
const APP_DESCRIPTION = 'Digitransit journey planning UI';
const OTP_TIMEOUT = process.env.OTP_TIMEOUT || 10000; // 10k is the current server default
const YEAR = 1900 + new Date().getYear();

export default {
  SENTRY_DSN,
  PORT,
  CONFIG,
  OTPTimeout: OTP_TIMEOUT,
  URL: {
    API_URL,
    ASSET_URL: process.env.ASSET_URL,
    MAP_URL,
    OTP: process.env.OTP_URL || `${API_URL}/routing/v1/routers/finland/`,
    MAP: {
      default: `${MAP_URL}/map/v1/hsl-map/`,
      sv: `${MAP_URL}/map/v1/hsl-map-sv/`,
    },
    STOP_MAP: `${MAP_URL}/map/v1/estonia-stop-map/`,
    CITYBIKE_MAP: `${MAP_URL}/map/v1/hsl-citybike-map/`,
    PARK_AND_RIDE_MAP: `${MAP_URL}/map/v1/estonia-parkandride-bikestop-map/`,
    ALERTS: process.env.ALERTS_URL || `${API_URL}/realtime/service-alerts/v1`,
    FONT:
      'https://fonts.googleapis.com/css?family=Lato:300,400,900%7CPT+Sans+Narrow:400,700',
    PELIAS: `${process.env.GEOCODING_BASE_URL || GEOCODING_BASE_URL}/search`,
    PELIAS_AUTOCOMPLETE: `${process.env.GEOCODING_BASE_URL ||
      GEOCODING_BASE_URL}/autocomplete`,
    PELIAS_REVERSE_GEOCODER: `${process.env.GEOCODING_BASE_URL ||
      GEOCODING_BASE_URL}/reverse`,
    ROUTE_TIMETABLES: {
      HSL: `${API_URL}/timetables/v1/hsl/routes/`,
    },
  },

  APP_PATH: `${APP_PATH}`,
  title: 'peatus.ee',

  textLogo: false,
  // Navbar logo
  logo: 'estonia/logo_1_valge.png',

  favicon: './app/configurations/images/estonia/p_1_2.png',

  contactName: {
    sv: 'Digitransit',
    fi: 'Digitransit',
    default: "Digitransit's",
  },

  // Default labels for manifest creation
  name: 'Digitransit beta',
  shortName: 'Digitransit',

  searchParams: { size: 20 },
  feedIds: ['estonia', 'elron'],

  defaultMapCenter: {
    lat: 58.790978,
    lon: 25.558043,
  },

  parkAndRide: {
    showParkAndRide: true,
    parkAndRideMinZoom: 14,
  },

  // Google Tag Manager id
  GTMid: 'GTM-MTJDVMG',

  /*
 * by default search endpoints from all but gtfs sources, correct gtfs source
 * figured based on feedIds config variable
 */
  searchSources: ['oa'],

  search: {
    suggestions: {
      useTransportIcons: false,
    },
    usePeliasStops: true,
    mapPeliasModality: false,
    peliasMapping: {},
    peliasLayer: null,
    peliasLocalization: null,
    minimalRegexp: new RegExp('.+'),
    /* identify searches for route numbers/labels: bus | train | metro */
    lineRegexp: new RegExp(
      '(^[0-9]+[a-z]?$|^[yuleapinkrtdz]$|(^m[12]?b?$))',
      'i',
    ),
  },

  nearbyRoutes: {
    radius: 10000,
    bucketSize: 1000,
  },

  defaultSettings: {
    accessibilityOption: null,
    bikeSpeed: 5,
    minTransferTime: 120,
    optimize: 'QUICK',
    preferredRoutes: [],
    ticketTypes: null,
    transferPenalty: 0,
    unpreferredRoutes: [],
    walkBoardCost: 600,
    walkReluctance: 2,
    walkSpeed: 1.2,
  },

  /**
   * These are used for dropdown selection of values to override the default
   * settings. This means that values ought to be relative to the current default.
   * If not, the selection may not make any sense.
   */
  defaultOptions: {
    walkBoardCost: {
      least: 3600,
      less: 1200,
      more: 360,
      most: 120,
    },
    walkReluctance: {
      least: 5,
      less: 3,
      more: 1,
      most: 0.2,
    },
  },

  quickOptions: {
    public_transport: {
      availableOptionSets: [
        'least-transfers',
        'least-walking',
        'public-transport-with-bicycle',
        'saved-settings',
      ],
    },
    walk: {
      availableOptionSets: ['prefer-walking-routes', 'saved-settings'],
    },
    bicycle: {
      availableOptionSets: [
        'least-elevation-changes',
        'prefer-greenways',
        'saved-settings',
      ],
    },
    car_park: {
      availableOptionSets: [
        'least-transfers',
        'least-walking',
        'saved-settings',
      ],
    },
  },

  maxWalkDistance: 10000,
  maxBikingDistance: 100000,
  itineraryFiltering: 1.5, // drops 66% worse routes
  availableLanguages: ['et', 'ru', 'en', 'fi'],
  defaultLanguage: 'et',
  // This timezone data will expire on 31.12.2020
  timezoneData:
    'Europe/Helsinki|EET EEST|-20 -30|01010101010101010101010|1BWp0 1qM0 WM0 1qM0 ' +
    'WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00|35e5',

  mainMenu: {
    // Whether to show the left menu toggle button at all
    show: true,
    showDisruptions: true,
    showLoginCreateAccount: true,
    showOffCanvasList: true,
  },

  itinerary: {
    // How long vehicle should be late in order to mark it delayed. Measured in seconds.
    delayThreshold: 180,
    // Wait time to show "wait leg"? e.g. 180 means over 3 minutes are shown as wait time.
    // Measured in seconds.
    waitThreshold: 180,
    enableFeedback: false,

    timeNavigation: {
      enableButtonArrows: false,
    },

    showZoneLimits: false,
  },

  nearestStopDistance: {
    maxShownDistance: 5000,
  },

  map: {
    useRetinaTiles: true,
    tileSize: 512,
    zoomOffset: -1,
    minZoom: 1,
    maxZoom: 18,
    controls: {
      zoom: {
        // available controls positions: 'topleft', 'topright', 'bottomleft, 'bottomright'
        position: 'bottomleft',
      },
      scale: {
        position: 'bottomright',
      },
    },
    genericMarker: {
      // Do not render name markers at zoom levels below this value
      nameMarkerMinZoom: 18,

      popup: {
        offset: [106, 16],
        maxWidth: 250,
        minWidth: 250,
      },
    },

    line: {
      halo: {
        weight: 7,
        thinWeight: 4,
      },

      leg: {
        weight: 5,
        thinWeight: 2,
      },

      passiveColor: '#758993',
    },

    useModeIconsInNonTileLayer: false,
  },

  stopCard: {
    header: {
      showDescription: true,
      showStopCode: true,
      showDistance: true,
      showZone: false,
    },
  },

  autoSuggest: {
    // Let Pelias suggest based on current user location
    locationAware: true,
  },

  cityBike: {
    // Config for map features. NOTE: availability for routing is controlled by
    // transportModes.citybike.availableForSelection
    showCityBikes: false,
    showStationId: true,

    useUrl: {
      fi: 'https://www.hsl.fi/kaupunkipyorat',
      sv: 'https://www.hsl.fi/sv/stadscyklar',
      en: 'https://www.hsl.fi/en/citybikes',
    },

    cityBikeMinZoom: 14,
    cityBikeSmallIconZoom: 14,
    // When should bikeshare availability be rendered in orange rather than green
    fewAvailableCount: 3,
  },
  // Lowest level for stops and terminals are rendered
  stopsMinZoom: 13,
  // Highest level when stops and terminals are still rendered as small markers
  stopsSmallMaxZoom: 14,
  // Highest level when terminals are still rendered instead of individual stops
  terminalStopsMaxZoom: 17,
  terminalStopsMinZoom: 12,
  terminalNamesZoom: 16,
  stopsIconSize: {
    small: 8,
    selected: 28,
    default: 18,
  },

  appBarLink: { name: 'Maanteeamet', href: 'https://www.mnt.ee/' },

  colors: {
    primary: '#006EB5',
  },

  sprites: 'assets/svg-sprite.default.svg',

  disruption: {
    showInfoButton: true,
  },

  agency: {
    show: true,
  },

  socialMedia: {
    title: 'Digitransit',
    description: APP_DESCRIPTION,
    locale: 'en_US',

    image: {
      url: '/img/default-social-share.png',
      width: 2400,
      height: 1260,
    },

    twitter: {
      card: 'summary_large_image',
      site: '@hsldevcom',
    },
  },

  meta: {
    description: APP_DESCRIPTION,
    keywords: 'digitransit',
  },

  // Ticket information feature toggle
  showTicketInformation: false,
  useTicketIcons: false,
  showRouteInformation: false,

  modeToOTP: {
    bus: 'BUS',
    tram: 'TRAM',
    rail: 'RAIL',
    subway: 'SUBWAY',
    citybike: 'BICYCLE_RENT',
    airplane: 'AIRPLANE',
    ferry: 'FERRY',
    walk: 'WALK',
    bicycle: 'BICYCLE',
    car: 'CAR',
    car_park: 'CAR_PARK',
    public_transport: 'WALK',
  },

  // Control what transport modes that should be possible to select in the UI
  // and whether the transport mode is used in trip planning by default.
  transportModes: {
    bus: {
      availableForSelection: true,
      defaultValue: true,
    },

    tram: {
      availableForSelection: true,
      defaultValue: true,
    },

    rail: {
      availableForSelection: true,
      defaultValue: true,
    },

    subway: {
      availableForSelection: true,
      defaultValue: true,
    },

    airplane: {
      availableForSelection: true,
      defaultValue: true,
    },

    ferry: {
      availableForSelection: true,
      defaultValue: true,
    },
  },

  streetModes: {
    public_transport: {
      availableForSelection: true,
      defaultValue: true,
      exclusive: false,
      icon: 'bus-withoutBox',
    },

    walk: {
      availableForSelection: true,
      defaultValue: false,
      exclusive: true,
      icon: 'walk',
    },

    bicycle: {
      availableForSelection: true,
      defaultValue: false,
      exclusive: true,
      icon: 'bicycle-withoutBox',
    },

    car: {
      availableForSelection: true,
      defaultValue: false,
      exclusive: true,
      icon: 'car-withoutBox',
    },

    car_park: {
      availableForSelection: false,
      defaultValue: false,
      exclusive: false,
      icon: 'car_park-withoutBox',
    },
  },

  accessibilityOptions: [
    {
      messageId: 'accessibility-nolimit',
      displayName: 'Ei rajoitusta',
      value: '0',
    },
    {
      messageId: 'accessibility-limited',
      displayName: 'Liikun pyörätuolilla',
      value: '1',
    },
  ],

  moment: {
    relativeTimeThreshold: {
      seconds: 55,
      minutes: 59,
      hours: 23,
      days: 26,
      months: 11,
    },
  },

  customizeSearch: {
    walkReluctance: {
      available: true,
    },

    walkBoardCost: {
      available: true,
    },

    transferMargin: {
      available: true,
    },

    walkingSpeed: {
      available: true,
    },

    ticketOptions: {
      available: true,
    },

    accessibility: {
      available: true,
    },
    transferpenalty: {
      available: true,
    },
  },

  areaPolygon: [],

  // Minimun distance between from and to locations in meters. User is noticed
  // if distance is less than this.
  minDistanceBetweenFromAndTo: 20,

  // If certain mode(s) only exist in limited number of areas, listing the areas as a list of polygons for
  // selected mode key will remove the mode(s) from queries if no coordinates in the query are within the polygon(s).
  // This reduces complexity in finding routes for the query.
  modePolygons: {},

  footer: {
    et: [
      { label: `© Maanteeamet ${YEAR}` },
      {},
      {
        name: 'footer-feedback',
        nameEn: 'Submit feedback',
        href:
          'https://app.recommy.com/SI/SI.aspx?id=&td=Mi1bkew0I9w=&tg=TkxWhz5XDF4=&TL=5U3QQE93T/0=&si=1&st=1',
        icon: 'icon-icon_speech-bubble',
      },
      {
        name: 'about-this-service',
        nameEn: 'About this service',
        route: '/tietoja-palvelusta',
        icon: 'icon-icon_info',
      },
    ],
    en: [
      { label: `© Maanteeamet ${YEAR}` },
      {},
      {
        name: 'footer-feedback',
        nameEn: 'Submit feedback',
        href:
          'https://app.recommy.com/SI/SI.aspx?id=&td=7op6SqiaLzk=&tg=TkxWhz5XDF4=&TL=tsyn3gyGHcQ=&si=1&st=1',
        icon: 'icon-icon_speech-bubble',
      },
      {
        name: 'about-this-service',
        nameEn: 'About this service',
        route: '/tietoja-palvelusta',
        icon: 'icon-icon_info',
      },
    ],
    fi: [
      { label: `© Maanteeamet ${YEAR}` },
      {},
      {
        name: 'footer-feedback',
        nameEn: 'Submit feedback',
        href:
          'https://app.recommy.com/SI/SI.aspx?id=&td=N7BXNUTBGHQ=&tg=TkxWhz5XDF4=&TL=OWN9c1aiwPM=&si=1&st=1',
        icon: 'icon-icon_speech-bubble',
      },
      {
        name: 'about-this-service',
        nameEn: 'About this service',
        route: '/tietoja-palvelusta',
        icon: 'icon-icon_info',
      },
    ],
    ru: [
      { label: `© Maanteeamet ${YEAR}` },
      {},
      {
        name: 'footer-feedback',
        nameEn: 'Submit feedback',
        href:
          'https://app.recommy.com/SI/SI.aspx?id=&td=hVgAtJmFpGk=&tg=TkxWhz5XDF4=&TL=vF8qXhonlDQ=&si=1&st=1',
        icon: 'icon-icon_speech-bubble',
      },
      {
        name: 'about-this-service',
        nameEn: 'About this service',
        route: '/tietoja-palvelusta',
        icon: 'icon-icon_info',
      },
    ],
  },

  // Default origin endpoint to use when user is outside of area
  defaultEndpoint: {
    icon: 'icon-icon_rail',
    label: 'Tallinn Balti jaam',
    lat: 59.4399864,
    lon: 24.7371067,
  },
  defaultOrigins: [
    {
      icon: 'icon-icon_rail',
      label: 'Tallinn Balti jaam',
      lat: 59.4399864,
      lon: 24.7371067,
    },
    {
      icon: 'icon-icon_airplane',
      label: 'Tallinna Lennujaam',
      lat: 59.4146841,
      lon: 24.8074284,
    },
  ],

  availableRouteTimetables: {},

  routeTimetableUrlResolver: {},

  aboutThisService: {
    en: [
      {
        header: 'About this service',
        paragraphs: [
          'Welcome to the Journey Planner!',
          'The Journey Planner helps you find the fastest and easiest way of getting to your destination by public transport in Estonia. On this site, you can also plan your journey by entering the place of departure and destination, or picking them from the map. The Journey Planner will display various journey options according to the place of departure and destination as well as the other parameters you’ve entered.',
        ],
      },
      {
        header: 'Digitransit platform',
        paragraphs: [
          'The Journey Planner uses the Digitransit platform (https://digitransit.fi/en/). It is an open source routing platform developed by HSL (Helsinki Regional Transport Authority) and Traficom.',
        ],
      },
      {
        header: 'Data sources',
        paragraphs: [
          'The maps, streets, buildings, etc. are provided by © OpenStreetMap users. Address data is obtained from the database of the Estonian Land Board. The data relating to public transport routes and stops are obtained from the Public Transport Register of the Road Administration.',
        ],
      },
    ],
    et: [
      {
        header: 'Teenusest',
        paragraphs: [
          'Tere tulemast reisiplaneerijasse!',
          'Reisiplaneerija aitab sul leida kõige kiirema ja mugavama võimaluse sihtkohta jõudmiseks kasutades selleks ühistransporti terves Eestis. Sellel lehel saate planeerida oma reisi, sisestades algus- ja lõpp-punkti või määrates selle kaardilt. Reisiplaneerija kuvab Teile erinevaid teekonna võimalusi vastavalt Teie poolt sisestatud lähte- ja sihtkohale ning muudele otsinguparameetritele.',
        ],
      },
      {
        header: 'Digitransit platvorm',
        paragraphs: [
          'Reisiplaneerija kasutab Digitransit platvormi (https://digitransit.fi/en/). See on avatud lähtekoodiga marsruutimisplatvorm, mille on välja töötanud HSL (Helsingi Regiooni Transpordiamet) ja Traficom.',
        ],
      },
      {
        header: 'Andmeallikad',
        paragraphs: [
          'Kaardid, tänavad, hooned jne on antud © OpenStreetMap kasutajate poolt. Aadressandmed saadakse Maa-ameti andmestikust. Ühistranspordiliinide ja peatuste andmed pärinevad Maanteeameti Ühistranspordiregistrist.',
        ],
      },
    ],
    fi: [
      {
        header: 'Palvelusta',
        paragraphs: [
          'Tervetuloa reittiopas-palveluun!',
          'Reittiopas auttaa sinua löytämään nopeimman ja helpoimman vaihtoehdon kohteeseen pääsyyn joukkoliikenteellä koko Virossa. Tällä sivulla voit suunnitella matkasi syöttämällä lähtöpaikan ja määränpään tai määrittelemällä ne kartalta. Reittiopas kuvaa sinulle erilaisia reittivaihtoehtoja syöttämäsi lähtöpaikan ja määränpään sekä muiden hakuehtojen mukaisesti.',
        ],
      },
      {
        header: 'Digitransit-palvelualusta',
        paragraphs: [
          'Reittiopas käyttää Digitransit-alustaa (https://digitransit.fi/en/). Se on HSL:n (Helsingin seudun liikenne) ja Traficomin työstämä avoimen lähdekoodin reitinsuunnittelun palvelualusta.',
        ],
      },
      {
        header: 'Tietolähteet',
        paragraphs: [
          'Kartat, kadut, rakennukset jne. on saatu © OpenStreetMap -käyttäjiltä. Osoitetiedot saadaan Viron tielaitoksen tiedostoista. Joukkoliikenteen ja pysäkkien tiedot ovat peräisin Viron tielaitoksen joukkoliikennerekisteristä.',
        ],
      },
    ],
    ru: [
      {
        header: 'Об услуге',
        paragraphs: [
          'Добро пожаловать в планировщик поездок!',
          'Планировщик поездок поможет Вам найти самый быстрый и удобный вариант маршрута до места назначения, используя для этого общественный транспорт Эстонии. На этой странице Вы можете спланировать свою поездку, введя исходный и конечный пункты или указав их на карте. Планировщик поездок покажет Вам разные варианты маршрута согласно введенному Вами исходному пункту и пункту назначения, а также иным параметрам поиска.',
        ],
      },
      {
        header: 'Платформа Digitransit',
        paragraphs: [
          'Планировщик поездок использует платформу Digitransit (https://digitransit.fi/en/). Эту платформу маршрутов с открытым исходным кодом разработали HSL (Транспортное управление Хельсинки) и Traficom.',
        ],
      },
      {
        header: 'Источники данных',
        paragraphs: [
          'Карты, улицы, здания и т. д. предоставлены пользователями © OpenStreetMap. Адресные данные поступают из базы данных Земельного департамента. Данные по линиям и остановкам общественного транспорта берутся из регистра общественного транспорта Департамента шоссейных дорог.',
        ],
      },
    ],
  },

  staticMessages: [
    {
      id: '1',
      priority: 1,
      shouldTrigger: true,
      persistence: 'repeat',
      content: {
        et: [
          {
            type: 'text',
            content:
              'Sellel veebilehel kasutatakse küpsiseid. Kasutamist jätkates nõustute küpsiste ja veebilehe üldtingimustega. Loe täpsemalt: ',
          },
          {
            type: 'a',
            content: 'Eraelulise teabe kaitse',
            href: 'https://www.mnt.ee/et/ametist/eraelulise-teabe-kaitse',
          },
        ],
        en: [
          {
            type: 'text',
            content:
              'We use cookies to improve our services. By using this site, you agree to its use of cookies. Read more: ',
          },
          {
            type: 'a',
            content: 'Terms of use',
            href: 'https://www.mnt.ee/et/ametist/eraelulise-teabe-kaitse',
          },
        ],
        fi: [
          {
            type: 'text',
            content:
              'Käytämme evästeitä palveluidemme kehitykseen. Käyttämällä sivustoa hyväksyt evästeiden käytön. Lue lisää: ',
          },
          {
            type: 'a',
            content: 'Käyttöehdot',
            href: 'https://www.mnt.ee/et/ametist/eraelulise-teabe-kaitse',
          },
        ],
      },
    },
    {
      id: '2',
      priority: 2,
      shouldTrigger: true,
      persistence: 'repeat',
      content: {
        et: [
          {
            type: 'text',
            content:
              'Tere! See on uus reisiplaneerija. Kui soovite kasutada vana peatus.ee lehte, siis see asub ',
          },
          {
            type: 'a',
            content: 'siin.',
            href: 'http://vana.peatus.ee',
          },
          {
            type: 'text',
            content: 'Uuele portaalile saad tagasisidet anda ',
          },
          {
            type: 'a',
            content: 'siin.',
            href: 'https://www.mnt.ee/et/tagasiside-uuele-reisiplaneerijale',
          },
        ],
      },
    },
  ],

  themeMap: {
    estonia: 'estonia',
    hsl: 'reittiopas',
    turku: '(turku|foli)',
    lappeenranta: 'lappeenranta',
    joensuu: 'joensuu',
    oulu: 'oulu',
    hameenlinna: 'hameenlinna',
    matka: 'matka',
    rovaniemi: 'rovaniemi',
    kouvola: 'kouvola',
    tampere: 'tampere',
    mikkeli: 'mikkeli',
    kotka: 'kotka',
    jyvaskyla: 'jyvaskyla',
    lahti: 'lahti',
    kuopio: 'kuopio',
  },

  minutesToDepartureLimit: 9,

  imperialEnabled: false,
  // this flag when true enables imperial measurements  'feet/miles system'

  mapLayers: {
    featureMapping: {
      ticketSales: {},
    },
    // tooltip: {
    //   en: 'New! You can now get zones on the map from the settings.',
    //   et: 'Uus! Nüüd saad kaarditsoone valida seadetest.',
    //   fi: 'Uutta! Saat nyt vyöhykkeet kartalle asetuksista.',
    //   ru: 'New! You can now get zones on the map from the settings.',
    // },
  },

  routeTimetables: {},
};
