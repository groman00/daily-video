#include "./Effects.js"
#include "./Transitions.js"
#include "./TextAlignment.js"

var fx = new Effects();
var transitions = new Transitions();
var textAlignment = new TextAlignment();

/**/
function Renderer(folders, slide, compName, config) {
    this.folder = folders.video;
    this.slide = slide;
    this.theme = config.theme;
    this.format = config.format;
    this.data = slide.data;
    this.type = this.data.slideType;
    this.template = this.data.slideTemplate;

    // Create a comp that fits the selected format (square or landscape)
    this.comp = UTILS.findCompByName(folders.comps, 'format_' + this.format).duplicate();
    this.comp.name = compName;

    // Create a comp for the current theme
    this.preComp = UTILS.findCompByName(UTILS.getFolderByName(this.type, folders.preComps), this.theme).duplicate();
    this.preComp.name = 'pre' + compName;

    this.transitionLayer = UTILS.findLayerByName(this.comp, 'transition');
    this.duration = this.data.duration = this.data.duration || UTILS.framesToSeconds(this.template.frames)
    this.render();
}

/**/
Renderer.prototype.getLayer = function (name) {
    return UTILS.findLayerByName(this.preComp, name);
}

/**/
Renderer.prototype.render = function () {
    var duration = this.duration;
    var fields = this.template.fields;
    var i;

    switch (this.format) {
        case 'square':
            this.formatSquare();
            break;
        case 'landscape':
            // do nothing
            break;
        default:
    }

    // run field functions to fill in variable content
    for (i = 0; i < fields.length; i++) {
        this[fields[i]]();
    }

    this.adjustDuration(this.preComp);
    this.adjustDuration(this.comp);

    // Add precomp to formatted comp, and parent it inside of the transition layer
    this.comp.layers.add(this.preComp).parent = this.transitionLayer;

    // Apply programmed transition and assign transition time values
    this.data.transition = transitions.apply(this);
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
            // layer.inPoint = 0;
            layer.outPoint = duration;
        }
    }
}

/**/
Renderer.prototype.caption = function () {
    var caption = this.slide.caption;
    var layer = this.getLayer('caption');
    if (this.type === 'quotation') {
        caption = '"' + caption + '"';
    }
    layer.sourceText.setValue(caption);

    // Do text alignment
    if (this.type === 'image' || this.type === 'video') {
        textAlignment.apply(this.data.textAlignment, this.comp, layer);
    }
}

/**/
Renderer.prototype.credit = function () {
    this.getLayer('credit').sourceText.setValue(this.slide.credit);
}

/**/
Renderer.prototype.title = function () {
    var title = this.slide.title;
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
    fx.apply(this.data.image.effect || 0, layer, this.duration);
}

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

/**/
Renderer.prototype.bumper = function () {
    this.getLayer('bumper_' + this.data.bumper).enabled = true;
}
