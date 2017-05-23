class ioProxy {

    constructor(io, socketId) {
        this.io = io;
        this.socketId = socketId;
    }

    emit(...data) {
        data[0] = data[0] + 'Proxy';
        data[1]["socketId"] = this.socketId;
        this.io.emit(...data);
    }
}

module.exports = ioProxy;
