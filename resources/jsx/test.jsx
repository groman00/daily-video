// https://github.com/BenZed/after-effects

// #include "DailyVideo.jsx"
// main('592d6acb1cdbc3640990a7a3', '/Library/WebServer/Documents/alpha/daily-video/');

#include "../js/json2.js"

var alignments = {
    0: "top-left",
    1: "top-center",
    2: "top-right",
    3: "middle-left",
    4: "middle-center",
    5: "middle-right",
    6: "bottom-left",
    7: "bottom-center",
    8: "bottom-right"
}

var comp = app.project.activeItem;
var layer = comp.layer(2);
var rect = layer.sourceRectAtTime(0, false);
var padding = 50;

var compCenter = [comp.width / 2, comp.height / 2];
var alignment = 7;
var anchorPoint = [0, 0];
var position = [0, 0];

// {"top":-629.374664306641,"left":-230.07861328125,"width":895.999145507812,"height":283.757629394531}

switch (alignment) {
    // top
    case 0:
        anchorPoint = [rect.left - padding, rect.top - padding];
        break;
    case 1:
        anchorPoint = [(rect.width / 2 + rect.left), rect.top - padding];
        position = [compCenter[0], 0];
        break;
    case 2:
        anchorPoint = [(rect.width + rect.left) + padding, rect.top - padding];
        position = [comp.width, 0];
        break;

    //middle
    case 3:
        anchorPoint = [rect.left - padding, (rect.height / 2) + rect.top];
        position = [0, compCenter[1]];
    case 4:
        anchorPoint = [(rect.width / 2 + rect.left), (rect.height / 2) + rect.top];
        position = compCenter;
    case 5:
        anchorPoint = [(rect.width + rect.left) + padding, (rect.height / 2) + rect.top];
        position = [comp.width, compCenter[1]];

    // bottom
    case 6:
        anchorPoint = [rect.left - padding, (rect.height + rect.top) + padding];
        position = [0, comp.height];
    case 7:
        anchorPoint = [(rect.width / 2 + rect.left), (rect.height + rect.top) + padding];
        position = [compCenter[0], comp.height];
    case 8:
        anchorPoint = [(rect.width + rect.left) + padding, (rect.height + rect.top) + padding];
        position = [comp.width, comp.height];

    default:
}

layer.transform.anchorPoint.setValue(anchorPoint);
layer.transform.position.setValue(position);









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



