const CONFIG = 'estonia';
const API_URL = process.env.API_URL || 'https://dev-api.digitransit.fi';
const GEOCODING_BASE_URL = process.env.GEOCODING_BASE_URL || `${API_URL}/geocoding/v1`;
const MAP_URL = process.env.MAP_URL || 'https://digitransit-dev-cdn-origin.azureedge.net';
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

    contactName: {
        sv: 'Digitransit',
        fi: 'Digitransit',
        default: "Digitransit's",
    },

    // Default labels for manifest creation
    name: 'Digitransit beta',
    shortName: 'Digitransit',

    searchParams: {},
    feedIds: ['estonia'],

    defaultMapCenter: {
        lat: 59.43724,
        lon: 24.74546,
    },

    parkAndRide: {
        showParkAndRide: true,
        parkAndRideMinZoom: 14,
    },

    realTime: {
        /* sources per feed Id */
        estonia: {
            mqtt: 'wss://uvn-233-169.ams01.zonevs.eu:4436',
            agency: 'Tallinna TA',
            routeSelector: function selectRoute(routePageProps) {
                const route = routePageProps.route.gtfsId.split(':');
                return route[1];
            },
        },
    },

    // Google Tag Manager id
    GTMid: 'GTM-PZV2S2V',

    /*
   * by default search endpoints from all but gtfs sources, correct gtfs source
   * figured based on feedIds config variable
   */
    searchSources: ['oa', 'osm'],

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
        accessibilityOption: 0,
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
        showCityBikes: true,
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
        trolley: 'SUBWAY',
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

        trolley: {
            availableForSelection: true,
            defaultValue: true,
        },

        airplane: {
            availableForSelection: false,
            defaultValue: false,
        },

        ferry: {
            availableForSelection: false,
            defaultValue: false,
        },

        citybike: {
            availableForSelection: false, // TODO: Turn off in autumn
            defaultValue: false, // always false
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

    areaPolygon: [
    ],

    // Minimun distance between from and to locations in meters. User is noticed
    // if distance is less than this.
    minDistanceBetweenFromAndTo: 20,

    // If certain mode(s) only exist in limited number of areas, listing the areas as a list of polygons for
    // selected mode key will remove the mode(s) from queries if no coordinates in the query are within the polygon(s).
    // This reduces complexity in finding routes for the query.
    modePolygons: {},

    footer: {
        content: [
            { label: `© Maanteeamet ${YEAR}` },
            {},
            {
                name: 'footer-feedback',
                nameEn: 'Submit feedback',
                href: 'https://github.com/HSLdevcom/digitransit-ui/issues',
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
        lon: 24.7371067
    },
    defaultOrigins: [
        {
            icon: 'icon-icon_rail',
            label: 'Tallinn Balti jaam',
            lat: 59.4399864,
            lon: 24.7371067
        },
        {
          icon: 'icon-icon_airplane',
          label: 'Tallinna Lennujaam',
          lat: 59.4146841,
          lon: 24.8074284
        }
    ],

    availableRouteTimetables: {},

    routeTimetableUrlResolver: {},

    aboutThisService: {
        en: [
            {
                header: 'About this service',
                paragraphs: [
                    'The service covers public transport, walking, cycling, and some private car use. Service is built on Digitransit platform.',
                ],
            },
            {
                header: 'Digitransit platform',
                paragraphs: [
                    'The Digitransit service platform is an open source routing platform developed by HSL and Traficom.',
                ],
            },
            {
                header: 'Data sources',
                paragraphs: [
                    "Maps, streets, buildings, stop locations etc. are provided by © OpenStreetMap contributors. Address data is retrieved from the Building and Dwelling Register of the Finnish Population Register Center. Public transport routes and timetables are downloaded from Traficom's national public transit database.",
                ],
            },
        ],
        et: [
            {
                header: 'Teenusest',
                paragraphs: [
                    'Teenus hõlmab ühistransporti, kõndimist, jalgrattasõitu ja mõnda isiklikku auto kasutamist. Teenus on ehitatud Digitransit platvormil.',
                ],
            },
            {
                header: 'Digitransit platvorm',
                paragraphs: [
                    'Digitransit teenindusplatvorm on avatud lähtekoodiga marsruutimisplatvorm, mille on välja töötanud HSL ja Traficom.',
                ],
            },
            {
                header: 'Andmeallikad',
                paragraphs: [
                    "Kaardid, tänavad, hooned, peatuste asukohad jne on antud © OpenStreetMap kasutajate poolt. Aadressiandmed saadakse Soome Rahvastikuregistri Keskuse Elukoha ja Kinnistute registrist. Ühistranspordiliinid ja sõiduplaanid laaditakse alla riiklikust ühistranspordi andmebaasist Traficom.",
                ],
            },
        ],
        fi: [
            {
                header: 'Tietoja palvelusta',
                paragraphs: [
                    'Palvelu kattaa joukkoliikenteen, kävelyn, pyöräilyn ja yksityisautoilun rajatuilta osin. Palvelu perustuu Digitransit-palvelualustaan.',
                ],
            },
            {
                header: 'Digitransit-palvelualusta',
                paragraphs: [
                    'Digitransit-palvelualusta on HSL:n ja Traficomin kehittämä avoimen lähdekoodin reititystuote.',
                ],
            },
            {
                header: 'Tietolähteet',
                paragraphs: [
                    'Kartat, tiedot kaduista, rakennuksista, pysäkkien sijainnista ynnä muusta tarjoaa © OpenStreetMap contributors. Osoitetiedot tuodaan Väestörekisterikeskuksen rakennustietorekisteristä. Joukkoliikenteen reitit ja aikataulut ladataan Traficomin valtakunnallisesta joukkoliikenteen tietokannasta.',
                ],
            },
        ],
        ru: [
            {
                header: 'Об услуге',
                paragraphs: [
                    'Услуга распространяется на общественный транспорт, прогулку пешком и велосипедные прогулки, а также на частном автомобиле. Сервис построен на платформе Digitransit.',
                ],
            },
            {
                header: 'Платформа Digitransit',
                paragraphs: [
                    'Сервисная платформа Digitransit - это платформа маршрутизации с открытым исходным кодом, разработанная компаниями HSL и Traficom. \',',
                ],
            },
            {
                header: 'Источники данных',
                paragraphs: [
                    "Карты, улицы, здания, местоположения остановок и т. д. предоставлены ️ участниками © ️OpenStreetMap. Адресные данные извлекаются из Системы Финского регистра народонаселения. Маршруты и расписание общественного транспорта загружаются из национальной базы данных общественного транспорта Traficom.",
                ],
            },
        ],
    },

    staticMessages: [],

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
        tooltip: {
            en: 'New! You can now get zones on the map from the settings.',
            et: 'Uus! Nüüd saad kaarditsoone valida seadetest.',
            fi: 'Uutta! Saat nyt vyöhykkeet kartalle asetuksista.',
            ru: 'New! You can now get zones on the map from the settings.',
        },
    },

    routeTimetables: {},
};
