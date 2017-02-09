var spawn = require('child_process').spawn;

module.exports = function () {

    var ae = spawn('osascript', [
        '-e', 'tell application "Adobe After Effects CC 2017" to activate',
        '-e', 'tell application "Adobe After Effects CC 2017" to DoScriptFile "/Library/WebServer/Documents/alpha/daily-video/resources/jsx/DailyVideo.jsx"'
    ]);

    ae.stderr.on('data', function (data) {
        // Error occured
        console.log('stderr: ' + data);
    });

    ae.on('close', function (code) {
        console.log('Video has rendered');
    });

}