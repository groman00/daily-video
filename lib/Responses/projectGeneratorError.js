const helpers = require('../helpers');

module.exports = (socket, payload) => {
    helpers.emit(socket, ['project-error', Object.assign({ message: 'Error Generating Project' }, payload)]);
};
