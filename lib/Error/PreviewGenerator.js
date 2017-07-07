module.exports = class PreviewGeneratorError extends require('./ExtendableError') {
    constructor (message) {
        super(message || 'Preview Generator Error');
    }
};
