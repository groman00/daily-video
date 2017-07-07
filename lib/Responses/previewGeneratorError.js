const helpers = require('../helpers');

module.exports = (socket, type) => {
    helpers.emit(socket, ['preview-error', 'Error Generating Preview']);
};
