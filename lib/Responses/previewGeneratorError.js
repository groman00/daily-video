const helpers = require('../helpers');

module.exports = (socket, payload) => {
    helpers.emit(socket, ['preview-error', Object.assign({ message: 'Error Generating Preview' }, payload)]);
};
