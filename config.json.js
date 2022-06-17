// PRODUCTION, STAGING, and DEVELOPER  
const ENVIRONMENT = {
    'STAGING': 'STAGING',
    'PRODUCTION': 'PRODUCTION',
    'DEVELOPER': 'DEVELOPER',
};
// Set environment
const BUILD_MODE = ENVIRONMENT['STAGING'];
// Control flag to set if we need to display log based on ENVIRONMENT
let IS_LOG_ENABLED = false;
// Decide environment variabled based on ENVIRONMENT we run on 
switch (BUILD_MODE) {
    case "DEVELOPER":
        IS_LOG_ENABLED = true;
        break;
    case "STAGING":
        IS_LOG_ENABLED = falsess;
        break;
    case "PRODUCTION":
        IS_LOG_ENABLED = false;
        break;
    default:
        IS_LOG_ENABLED = true;
}
let conf = {
    "is_log_enabled": IS_LOG_ENABLED,
};