let io;

/**
 * Return app instance of socket io.
 */
module.exports = function (instance) {
    if (instance) {
        io = instance;
    }
    return io;
}