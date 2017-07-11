const helpers = require('../helpers');

module.exports = (socket, type) => {
    helpers.emit(socket, [`${type}-error`, 'Error Running Job']);
};
