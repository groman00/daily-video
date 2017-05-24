#include "./effects.js"

var FX = new Effects();

/**/
function Renderer(folders, slide, compName, config) {
    this.folder = folders.video;
    this.slide = slide;
    this.theme = config.theme;
    this.format = config.format;
    this.data = slide.data;

    this.type = this.data.slideType;
    this.template = this.data.slideTemplate;
    // this.templateName = this.type + '_' + this.template.name;

    this.characters = this.template.characters

    // Create a comp that fits the selected format (square or landscape)
    this.comp = UTILS.findCompByName(folders.comps, 'format_' + this.format).duplicate();
    this.comp.name = compName;

    // Create a comp for the current slide type
    // this.comp = UTILS.findCompByName(folders.comps, this.templateName).duplicate();
    // this.comp.name = compName;

    // Create a comp for the current theme
    this.preComp = UTILS.findCompByName(UTILS.getFolderByName(this.type, folders.preComps), this.theme).duplicate();
    this.preComp.name = 'pre' + compName;


    this.transitionLayer = UTILS.findLayerByName(this.comp, 'transition');
    // this.replacePreComp();
    // this.addPreComp();

    this.duration = this.data.duration || UTILS.framesToSeconds(this.template.frames)
    this.render();
}


/**
 * Replace the existing pre-comp template with the duplicate version
 */
/*
Renderer.prototype.replacePreComp = function() {


     // WE CAN REMOVE ALL COMPS, add images/video/etc directly to brand precomp.
     // The only comps needed are format comps.  Add layer to brand precomp that can be used to "center" contents inside
     // of the comp after it's cropped.


    var comp = this.comp;
    var precompTemplate = UTILS.findLayerByName(this.comp, this.theme)
    var layer = comp.layers.add(this.preComp)
    // layer.parent = this.transitionLayer;
    // layer.position.setValue([0, 0]);
    layer.moveBefore(precompTemplate);
    precompTemplate.remove();
};
*/

/**/
Renderer.prototype.getLayer = function (name) {
    return UTILS.findLayerByName(this.preComp, name);
}

/**/
Renderer.prototype.render = function () {
    var duration = this.duration;
    var fields = this.template.fields;
    var i;

    // run field functions to fill in variable content
    for (i = 0; i < fields.length; i++) {
        this[fields[i]]();
    }

    this.adjustDuration(this.preComp);
    this.adjustDuration(this.comp);

    // if (this.isSquare) {
        // this.formatSquare();
    // }

    switch (this.format) {
        case 'square':
            this.formatSquare();
            break;
        case 'landscape':
            break;
        default:
    }
    // this.applyFormat(this.config.format);

    this.addTransition();
    // this.adjustTransition();
}

/**/
Renderer.prototype.formatSquare = function() {
    var comp = this.preComp;
    var layer;
    // crop comp and position layers to center
    comp.width = 1080
    layer = comp.layers.addNull();
    layer.position.setValue([0, 540]);
    for(var i = 2, max = comp.numLayers; i <= max; i++){
        comp.layer(i).parent = layer;
    }
    layer.position.setValue([-420, 540]);
}

/**/
// Renderer.prototype.addPreComp = function() {
//     var layer = this.comp.layers.add(this.preComp);
//     layer.parent = this.transitionLayer;
// }

/**/
Renderer.prototype.addTransition = function() {
    var compLayer = this.comp.layers.add(this.preComp)
    var transitionLayer = this.transitionLayer;
    var position = transitionLayer.position;
    var transitionDuration = UTILS.framesToSeconds(10);
    var basePosition = 1080 / 2;

    compLayer.parent = transitionLayer;
    position.setValueAtTime(0, [basePosition + 1080, basePosition]);
    position.setValueAtTime(transitionDuration, [basePosition, basePosition]);
    position.setValueAtTime(this.duration - transitionDuration, [basePosition, basePosition]);
    position.setValueAtTime(this.duration, [basePosition * -1, basePosition]);
};

/**/
Renderer.prototype.caption = function () {
    var caption = this.slide.caption;
    //.substr(0, this.characters.caption);
    if (this.type === 'quotation') {
        caption = '"' + caption + '"';
    }
    this.getLayer('caption').sourceText.setValue(caption);
}

/**/
Renderer.prototype.credit = function () {
    this.getLayer('credit').sourceText.setValue(this.slide.credit);
}

/**/
Renderer.prototype.title = function () {
    var title = this.slide.title;
    // .substr(0, this.characters.title);
    if (this.type === 'quotation') {
        title = '- ' + title;
    }
    this.getLayer('title').sourceText.setValue(title);
}

/**/
Renderer.prototype.image = function () {
    var image = project.importFile(new ImportOptions(File(this.slide.image)));
    var layer = this.getLayer('image');
    image.parentFolder = this.folder;
    layer.replaceSource(image, true); // Set image source
    // GIF Handling
    if (this.slide.image_type === 'gif') {
        try {
            // need to resize the image beforehand.
            // this does not work if the comp has a scale transform already applied.
            UTILS.fitLayerToComp(this.comp, layer, image);
            if (layer.canSetTimeRemapEnabled) {
                layer.timeRemapEnabled = true;
                layer.timeRemap.expression = "loopOut('cycle');";
            }
        } catch(e) {
            //$.writeln(e);
        }
    }
    // FX.applyEffect(this.data.image.effect || 0, layer, this.duration);
}

/**
 * Adjust all layer durations to match slide duration, unless the layer name starts with an underscore
 * @param  {[type]} comp [description]
 * @return {[type]}      [description]
 */
Renderer.prototype.adjustDuration = function(comp) {
    var duration = this.duration;
    var count = comp.numLayers;
    var i;
    var layer;
    comp.duration = duration;
    for (i = 1; i <= count; i ++) {
        layer = comp.layer(i);
        if (layer.name.charAt(0) !== '_') {
            layer.inPoint = 0;
            layer.outPoint = duration;
        }
    }
}

/**/
/*
Renderer.prototype.adjustTransition = function() {
    var layer = this.transitionLayer
    var duration = this.duration;
    var inDuration = this.template.frames['in'] / fps;
    var outDuration = this.template.frames['out'] / fps;
    var position = layer.position;
    var keyValues = [];

    // Collect templated key values
    for (var i = 0, max = position.numKeys; i < max; i++) {
        keyValues.push([position.keyTime(i + 1), position.keyValue(i + 1)]);
    };
    // Remove templated keys (in reverse)
    for (var i = keyValues.length; i > 0; i--) {
        position.removeKey(i);
    }
    if (keyValues.length) {
        // Add adjusted keys
        position.setValueAtTime(0, keyValues[0][1]);
        position.setValueAtTime(0 + inDuration, keyValues[1][1]);
        position.setValueAtTime(duration - outDuration, keyValues[2][1]);
        position.setValueAtTime(duration, keyValues[3][1]);
    }
}
*/

/**/
Renderer.prototype.video = function () {
    var layer = this.getLayer('video');
    var video = project.importFile(new ImportOptions(File(this.slide.video)));
    var videoData = this.data.video;
    var inPoint = videoData.inPoint;
    var outPoint = videoData.outPoint;

    layer.replaceSource(video, false);
    this.comp.duration = this.data.video.duration;
    UTILS.fitLayerToComp(this.comp, layer, video);

    // trim video based on in/out values
    layer.inPoint = inPoint;
    layer.outPoint = outPoint;
    layer.startTime = layer.startTime - inPoint;
}
