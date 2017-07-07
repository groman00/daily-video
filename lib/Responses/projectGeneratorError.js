const helpers = require('../helpers');

module.exports = (socket, type) => {
    helpers.emit(socket, ['project-error', 'Error Generating Project']);
};
