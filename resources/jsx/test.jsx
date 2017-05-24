// https://github.com/BenZed/after-effects

#include "DailyVideo.jsx"
main('5925990e4f265d160d87a442', '/Library/WebServer/Documents/alpha/daily-video/');


/*
var comp = app.project.activeItem;
var layers = comp.layers;
comp.width = 1080;
var layer = layers.addNull();
layer.position.setValue([0, 540]);

for(var i = 2, max = comp.numLayers; i <= max; i++){
    comp.layer(i).parent = layer;
}

layer.position.setValue([-420, 540]);


*/



// $.writeln(app.project.activeItem.selectedProperties)

// #include "../js/json2.js"
// #include "../js/utils.js"

// var project = app.project;
// var prefabFolder = UTILS.getFolderByName('Prefabs');


/*
var fps = 29.97;
var transitionFrames = 10;
var transitionDuration = transitionFrames / fps;

var comp = UTILS.findCompByName(prefabFolder, 'video_template_1');
var video = project.importFile(new ImportOptions(File('/Library/WebServer/Documents/alpha/daily-video/resources/jsx/test.MOV')));
var duration = video.duration;
var videoLayer = comp.layer(2);
videoLayer.replaceSource(video, false);
comp.duration = duration;
videoLayer.outPoint = duration;


var positionProperty = videoLayer.position;
var keyValues = [];
for (var i = 0, max = positionProperty.numKeys; i < max; i++) {
    keyValues.push(positionProperty.keyValue(i + 1));
};
positionProperty.removeKey(2);
positionProperty.removeKey(3);
positionProperty.setValueAtTime(duration - transitionDuration, keyValues[2]);
positionProperty.setValueAtTime(duration, keyValues[3]);
*/


// var comp = UTILS.findCompByName(prefabFolder, 'title_template_1');

// alert(UTILS.findLayerByName(comp, 'transition'))

// alert(comp.layer(2).startTime)
//alert(comp.displayStartTime);
// comp.displayStartTime = 3.0;
// comp.workAreaStart = 2;
//comp.displayStartTime = 9.0

//app.executeCommand(2360);



