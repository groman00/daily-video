const LogManager = require('simple-node-logger');
const logManager = new LogManager();
const uncaughtServerError = require('../Responses/uncaughtServerError');
const opts = {
    // errorEventName: 'error',
    logDirectory: `${__dirname}/../../logs`,
    fileNamePattern: 'daily-video-<DATE>.log',
    dateFormat: 'YYYY-MM-DD'
};
let logger;

// Append console and file loggers
logManager.createConsoleAppender();
logManager.createRollingFileAppender(opts);

// Create Logger
logger = logManager.createLogger();

// Log errors to console and
module.exports = (error, res) => {
    logger.error(error.stack);

    // Respond with appropriate error
    // if ...



    return uncaughtServerError(res);
};

/*
process.on(opts.errorEventName, error => {
    console.log('process error', error);
});
*/
