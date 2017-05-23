require('dotenv').config();
require('./db');

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var routes = require('./routes/index');
var apiRoutes = require('./routes/api');
var io = require('./io');
const helpers = require('./lib/helpers');
var app = express();

/* Socket.io */
app.io = require('socket.io')()
app.io.on('connection', function(socket){

    socket
        // Send socket id to client
        .emit('register', socket.id)
        // allow the client to register to a room
        .on('room', (room) => {
            socket.join(room);
        })

        // proxy progress and completion data back to the client
        .on('progressProxy', (...data) => {
            const clientSocket = io().sockets.connected[data[0].socketId];
            data.unshift('progress');
            helpers.emit(clientSocket, data);
        })
        .on('completeProxy', (...data) => {
            const clientSocket = io().sockets.connected[data[0].socketId];
            data.unshift('complete');
            helpers.emit(clientSocket, data);
        })
        .on('preview-readyProxy', (...data) => {
            const clientSocket = io().sockets.connected[data[0].socketId];
            data.unshift('preview-ready');
            helpers.emit(clientSocket, data);
        })
});
io(app.io);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/api', apiRoutes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
