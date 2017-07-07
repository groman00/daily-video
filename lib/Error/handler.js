const LogManager = require('simple-node-logger');
const logManager = new LogManager();
const JobQueueError = require('./JobQueue');
const PreviewGeneratorError = require('./PreviewGenerator');
const uncaughtServerErrorResponse = require('../Responses/uncaughtServerError');
const jobQueueErrorResponse = require('../Responses/jobQueueError');
const previewGeneratorErrorResponse = require('../Responses/previewGeneratorError');
let logger;

// Append console and file loggers
logManager.createConsoleAppender();
logManager.createRollingFileAppender({
    // errorEventName: 'error',
    logDirectory: `${__dirname}/../../logs`,
    fileNamePattern: 'daily-video-<DATE>.log',
    dateFormat: 'YYYY-MM-DD'
});

// Create Logger
logger = logManager.createLogger();

/**
 * Handle Errors
 * @param  {Error} error
 * @param  {res|socket} responder
 * @return {void}
 */
module.exports = (error, responder) => {
    logger.error(error.stack);

    // Respond with appropriate error
    if (error instanceof JobQueueError) {
        return jobQueueErrorResponse(responder, error.type);
    } else if (error instanceof PreviewGeneratorError) {
        return previewGeneratorErrorResponse(responder);
    }

    return uncaughtServerErrorResponse(responder);
};

// process.on(opts.errorEventName, error => {
//     console.log('process error', error);
// });
