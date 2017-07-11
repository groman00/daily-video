module.exports = class JobQueueError extends require('./ExtendableError') {
    constructor (message, type) {
        super(`[${type}] ${(message || 'Job Queue Error')}`);
        this.type = type;
    }
};
