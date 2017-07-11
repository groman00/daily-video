module.exports = class ProjectGeneratorError extends require('./ExtendableError') {
    constructor (message) {
        super(message || 'Project Generator Error');
    }
};
