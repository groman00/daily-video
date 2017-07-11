const helpers = require('../helpers');

module.exports = (socket, payload) => {
    helpers.emit(socket, ['progress', payload]);
};
