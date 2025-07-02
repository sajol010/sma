const { COUNTRY_LIST } = require("./Api");

const CONSTANTS = {
    WEB_CLIENT_ID:
        '932238780865-ceef9pejfkcau41gquokgbh6sre52td1.apps.googleusercontent.com',
    ANDROID_ID:
        '932238780865-4bvrueob6d0qmb480t7ak7n28u7umr0h.apps.googleusercontent.com',
    IOS_ID:
        '932238780865-kb0aqjrtmrc5tgq9k29ptnhfjloqec3n.apps.googleusercontent.com',

    //APP Internal control
    CURRENT_BUILD_IOS: 71,
    CURRENT_BUILD_ANDROID: 71,
    //
    //App auto lock 
    AUTO_LOCK_TIME: 120, // in second

    SAMPLE_PDF_ID: 61,

    IS_BACKGROUND_HIDE: true,
    IS_IOS_IN_APP_PURCHASE_TEST: true,
    //TYPE
    SIGN_IN_WITH_FACEBOOK: 'facebook',
    SING_IN_WITH_GOOGLE: 'google',
    SING_IN_WITH_APPLE: 'apple',
    SING_IN_WITH_PASSWORD: 'password',
    SING_IN_WITH_BIOMETRIC: 'biometric',

    DEFAULT_DATE_FORMAT: 'dd/mm/yyyy',
    DEFAULT_TIME_FORMAT: '12-hour',

    //ASYNC STORAGE KEY
    //Profile
    PROFILE_STATUS: 'profile_status',
    //Settings
    IS_BIO_REQUIRED: 'is_bio_required',
    IS_BIO_EANBLED: 'is_bio_login_enabled',
    BIO_ENABLED_EMAIL: 'bio_login_enabled_email',
    //SignIn
    USER_TOKEN: 'user_token',
    USER_ID: 'user_id',
    USER_EMAIL: 'user_email',
    SIGN_IN_METHOD: 'sign_in_method',
    SETTING: 'setting',
    DATE_FORMAT: 'date_format',

    LOGIN_METHOD: 'Login_Email',
    LOGIN_PASS: 'Login_Pass',
    //Signup
    //USER_ID: 'user_id',
    //USER_EMAIL: 'user_email',
    //SIGN_IN_METHOD: 'sign_in_method',
    //PROFILE_STATUS: 'profile_status',
    //USER_ID: 'user_id',
    //Settings,
    //DATE_FORMAT: 'date_format',
    TIME_FORMAT: 'time_format',
    //Theme Provider
    CURRENT_THEME_NAME: 'currentThemeName',
    CURRENT_THEME: 'currentTheme',
    //Account
    TOKEN_KEY: 'TokenKey',

    //Theme Provider
    CURRENT_BG_NAME: 'currentBgName',
    CURRENT_BG_TYPE: 'currentBgType',
    CURRENT_BG: 'currentBg',

    UNREAD_COUNT: 'unreadCount',

    IS_DEVICE_TOKEN_UPLOAD: 'isDeviceTokenUpload',

    NDA_STATUS: {
        COMPLETED: 'complete',
    },

    API_KEY: {
        USER_EMAIL: 'user_email',
    },

    PROFILE: {
        NAME: 'profileName',
        EMAIL: 'profileEmail',
        PHONE: 'profilePhone',
        SEARCH_ADDRESS: 'searchAddress',
        FORMATED_ADDRESS: 'formatedAddress',

        AVATER: 'profileAvater',

        CITY: 'profileCity',
        STATE_ID: 'profileStateId',
        POSTAL_CODE: 'profilePostalCode',
        COUNTRY_CODE: 'profileCountryCode',

    },

    //Seetings background names
    BG_IMG: {
        HONEYCOMB: 'HoneycombBg',
        ELEGENT: 'ElegantBg',

        ABSTRACT_BLUE: 'abstractBlue', //'ShushLadyBg',
        ABSTRACT_GREY: 'abstractGrey',
        FLARE: 'flare', //DarkCloud
        DRAGON: 'dragonBg',
        FIREWORK: 'FireworkBg',
        WAVE: 'WaveBg',
        COLOR_SHIFT: 'ColorShiftBg',
        FLAREGOLD: 'flareGoldVideo',
        FLAREROSEGOLD: 'flareRoseGoldVideo',

        DARK_GOLD: 'darkGold',
        PEARL: 'pearlbg',
        SPARK: 'sparkbg',
        FLOWER: 'flowerbg',
        WATER_DROP: 'WaterDropBg',

        US_FLAG: 'usFlagBg',
        LGBT_PRIDE: 'lgbPrideBg',

        DEFAULT: 'DefaultBg',

        HARTONE: 'hartOne',
        HARTSECOND: 'hartSecond',
        HARTTHIRD: 'hartThird',

        //Video BG
        PINK_FLARE: 'pinkFlareVideoBg',
        GOLD_FLARE: 'goldFlareVideoBg',
        BLUE_FLARE: 'blueFlareVideoBg',
    },

    MESSAGE: {
        NDA_DESCRIPTION: "An NDA, which stands for Non-Disclosure Agreement, is a legal contract between two or more parties that outlines confidential information, knowledge, or material that they wish to share but restricts access to outside parties. Essentially, it's a legal way to ensure sensitive information is kept private. "
        //+ "\n Celebrities, actors, musical artists, social media influencers, and pro-sports players use NDAs every day when they want to keep something secret. We provide the same thing to you in a cool and super easy format."
    },

    UI: {

        //Video theme
        PINK_FLARE: 'pinkFlare',
        BLUE_FLARE: 'blueFlare',
        GOLD_FLARE: 'goldFlare',

        //Static Theme
        GOLD_FLOWER: 'goldFlower',
        GOLD_PEARL: 'goldPearl',
        GOLD_WATER_DROP: 'goldWaterDrop',

        //New flag theme
        US_FLAG: 'usFlag',
        LGBT_PRIDE: 'lgbtPride',

        HARTONE: 'hartOne',
        HARTSECOND: 'hartSecond',
        HARTTHIRD: 'hartThird',

        DEFAULT: 'default',

        //Unused UI
        // LIGHT: 'light',
        // HONEYCOMB: 'honeycomb',
        // ROSEGOLD: 'roseGold',
        // GOLD: 'gold',
        // ELEGENT: 'elegant',

        // ROSE_GOLD_PEARL: 'roseGoldPearl',
        // ROSE_GOLD_SPARK: 'roseGoldSpark',
        // ROSE_GOLD_FLOWER: 'roseGoldFlower',
        // ROSE_GOLD_DARK: 'roseGoldDark',
        // GOLD_SPARK: 'goldSpark',

        // GOLD_DARK: 'goldDark',
        // ELEGENT_WATER_DROP: 'elegantWaterDrop',
    },

    HTTP_STATUS_CODE: {
        OK: 200,
        CREATED: 201,
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
        UNPROCESSABLE: 422,
        INTERNAL_SERVER_ERROR: 500,
        GATEWAY_TIMEOUT: 504,
    },

    NET_CONNECTION_STATUS: {
        NEVER_SHOW: "NEVER_SHOW",
        INIT: 'INITIALIZE',

        OFFLINE: "OFFLINE",
        ONLINE: "ONLINE",
    }
    //Settings Theme names
};

module.exports = CONSTANTS;

