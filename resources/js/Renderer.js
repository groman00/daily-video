/**/
function Renderer(folders, slide, compName, theme) {

    this.folder = folders.video;
    this.slide = slide;
    this.theme = theme;
    this.data = slide.data;
    this.type = this.data.slideType;
    this.template = this.data.slideTemplate;
    this.templateName = this.type + '_' + this.template.name;
    this.characters = this.template.characters

    this.comp = UTILS.findCompByName(folders.comps, this.templateName).duplicate();
    this.comp.name = compName;

    this.preComp = UTILS.findCompByName(UTILS.getFolderByName(this.templateName, folders.preComps), theme).duplicate();
    this.preComp.name = 'pre' + compName;

    this.transitionLayer = UTILS.findLayerByName(this.comp, 'transition');
    this.replacePreComp();

    this.duration = this.data.duration || UTILS.framesToSeconds(this.template.frames.total)
    this.render();
}

/**
 * Replace the existing pre-comp template with the duplicate version
 */
Renderer.prototype.replacePreComp = function() {
    var comp = this.comp;
    var precompTemplate = UTILS.findLayerByName(this.comp, this.theme)
    var layer = comp.layers.add(this.preComp)
    layer.parent = this.transitionLayer;
    layer.position.setValue([0, 0]);
    layer.moveBefore(precompTemplate);
    precompTemplate.remove();
};

/**/
Renderer.prototype.getLayer = function (name) {
    // The layer with variable content can exist in the precomp OR the comp
    var layer = UTILS.findLayerByName(this.preComp, name);
    if (!layer) {
        return UTILS.findLayerByName(this.comp, name);
    }
    return layer;
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
    this.adjustTransition();
}

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
    UTILS.applyPanZoom(this.comp, layer, this.duration, 'OUT');
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
