const LogManager = require('simple-node-logger');
const logManager = new LogManager();
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
module.exports = error => {
    logger.error(error.stack);
};

/*
process.on(opts.errorEventName, error => {
    // error.ts
    // error.msg
    // error.level
    // error.pid
    console.log('process error', error);
});
*/
