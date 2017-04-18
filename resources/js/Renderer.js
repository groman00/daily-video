function Renderer(folder, slide, compName) {
    this.folder = folder;
    this.slide = slide;
    this.data = slide.data;
    this.type = this.data.slideType;
    this.template = this.data.slideTemplate;
    this.templateName = this.type + '_' + this.template.name;
    this.characters = this.template.characters
    this.comp = UTILS.findCompByName(UTILS.getFolderByName('Prefabs'), this.templateName).duplicate();
    this.comp.name = compName;
    this.duration = this.data.duration || UTILS.framesToSeconds(this.template.frames.total)
    this.render();
}

Renderer.prototype.getLayer = function (name) {
    return UTILS.findLayerByName(this.comp, name);
}

Renderer.prototype.render = function () {
    var duration = this.duration;
    var fields = this.template.fields;
    var i;
    for (i = 0; i < fields.length; i++) {
        this[fields[i]]();
    }

    // adjust template layers with transitions
    switch (this.type) {
        case 'video':
            var videoData = this.data.video;
            var inPoint = videoData.inPoint;
            var outPoint = videoData.outPoint;
            this.adjustLayer(this.getLayer('video'), inPoint, outPoint, false)
            this.adjustLayer(this.getLayer('caption'), inPoint, outPoint, false)
            this.adjustLayer(this.getLayer('transition'), inPoint, outPoint, true)
            this.comp.workAreaDuration = duration;
            break;
        case 'image':
            this.comp.duration = duration;
            this.adjustLayer(this.getLayer('image'), 0, duration, true);
            this.adjustLayer(this.getLayer('caption'), 0, duration, true);
            this.adjustLayer(this.getLayer('transition'), 0, duration, true);
            this.comp.workAreaDuration = duration;
            break;
        default:
    }
}

Renderer.prototype.caption = function () {
    var caption = this.slide.caption.substr(0, this.characters.caption);
    if (this.type === 'quotation') {
        caption = '"' + caption + '"';
    }
    this.getLayer('caption').sourceText.setValue(caption);
}

Renderer.prototype.title = function () {
    const title = this.slide.title.substr(0, this.characters.title);
    if (this.type === 'quotation') {
        title = '- ' + title;
    }
    this.getLayer('title').sourceText.setValue(title);
}

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
            this.fitLayerToComp(this.comp, this.comp.layer(2), image);
        } catch(e) {
            //$.writeln(e);
        }
        layer.timeRemapEnabled = true;
        layer.timeRemap.expression = "loopOut('cycle');";
    }
}

Renderer.prototype.adjustLayer = function(layer, inPoint, outPoint, hasTransitions) {
    var duration = this.duration;
    var inDuration = this.template.frames['in'] / fps;
    var outDuration = this.template.frames['out'] / fps;
    var position = layer.position;
    var keyValues = [];
    layer.inPoint = inPoint;
    layer.outPoint = outPoint;
    if (hasTransitions) {
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
            position.setValueAtTime(inPoint, keyValues[0][1]);
            position.setValueAtTime(inPoint + inDuration, keyValues[1][1]);
            position.setValueAtTime((inPoint + duration) - outDuration, keyValues[2][1]);
            position.setValueAtTime(inPoint + duration, keyValues[3][1]);
        }
    }
    layer.startTime = layer.startTime - inPoint;
};

Renderer.prototype.video = function () {
    var video = project.importFile(new ImportOptions(File(this.slide.video)));
    this.getLayer('video').replaceSource(video, false);
    this.comp.duration = this.data.video.duration;
}
