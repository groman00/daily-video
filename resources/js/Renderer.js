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
    this.render();
}

Renderer.prototype.getLayer = function (name) {
    return UTILS.findLayerByName(this.comp, name);
}

Renderer.prototype.render = function () {
    var fields = this.template.fields;
    var i;
    for (i = 0; i < fields.length; i++) {
        this[fields[i]]();
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

Renderer.prototype.video = function () {

    var duration = this.data.duration;
    var transitionInDuration = this.template.frames['in'] / fps;
    var transitionOutDuration = this.template.frames['out'] / fps;
    var videoData = this.data.video;
    var inPoint = videoData.inPoint;
    var outPoint = videoData.outPoint;
    var video = project.importFile(new ImportOptions(File(this.slide.video)));
    var videoLayer = this.getLayer('video');
    var captionLayer = this.getLayer('caption');
    var positionProperty = videoLayer.position;
    var keyValues = [];

    this.comp.duration = videoData.duration;

    videoLayer.replaceSource(video, false);
    videoLayer.inPoint = inPoint;
    videoLayer.outPoint = outPoint;
    captionLayer.inPoint = inPoint;
    captionLayer.outPoint = outPoint;

    for (var i = 0, max = positionProperty.numKeys; i < max; i++) {
        keyValues.push(positionProperty.keyValue(i + 1));
    };

    // Remove templated keys (in reverse)
    for (var i = 4; i > 0; i--) {
        positionProperty.removeKey(i);
    }

    // Add adjusted keys
    positionProperty.setValueAtTime(inPoint, keyValues[0]);
    positionProperty.setValueAtTime(inPoint + transitionInDuration, keyValues[1]);

    positionProperty.setValueAtTime((inPoint + duration) - transitionOutDuration, keyValues[2]);
    positionProperty.setValueAtTime((inPoint + duration) , keyValues[3]);

    // slide layer inPoints to the beginning of the comp, since there's no way to trim the comp
    captionLayer.startTime = captionLayer.startTime - inPoint;
    videoLayer.startTime = videoLayer.startTime - inPoint;

    // this.comp.workAreaStart = inPoint;
    this.comp.workAreaDuration = duration;
}
