var fps = 29.97;
var UTILS = {

    /**
     * Convert number of frames to seconds
     * @param  {int} frames
     * @return {Number}
     */
    framesToSeconds: function (frames) {
        return ( frames / fps );
    },

    /**
     * Read json file and parse to object;
     * @param  {String} path
     * @return {Object}
     */
    getJSON: function (path) {
        var file = File(path);
        var config;
        if (!file) {
            return false;
        }
        file.open('r');
        config = JSON.parse(file.read());
        file.close();
        return config;
    },

    /**
     * Create new comp and add it to top level of the project
     * @param {String} name
     * @param {Number} duration
     * @return {CompItem}
     */
    addComp: function (project, name, duration) {
        // (name, width, height, pixelAspect, duration, frameRate)
        return project.items.addComp(name, 1920, 1080, 1.0, duration, 29.97);
    },

    /**
     * Find comp within parent by name
     * @param  {FolderItem|CompItem} parent
     * @param  {String} name
     * @return {CompItem}
     */
    findCompByName: function (parent, name) {
        var comp, i;
        for (i = 1; i <= parent.numItems; i ++) {
            if ((parent.item(i) instanceof CompItem) && (parent.item(i).name === name)) {
                comp = parent.item(i);
                break;
            }
        }
        return comp;
    },

    /**
     * Find root folder by name
     * @param  {String} name
     * @return {FolderItem}
     */
    getFolderByName: function (name) {
        var folder, i;
        for (i = 1; i <= project.numItems; i ++) {
            if ((project.item(i) instanceof FolderItem) && (project.item(i).name === name)) {
                folder = project.item(i);
                break;
            }
        }
        return folder;
    },

    /**
     * Find comp within parent by name
     * @param  {CompItem} comp
     * @param  {String} layer name
     * @return {layer}
     */
    findLayerByName: function (comp, name) {
        var layers = comp.layers,
            layer, i;
        for (i = 1; i <= layers.length; i ++) {
            if (comp.layer(i).name === name) {
                layer = comp.layer(i);
                break;
            }
        }
        return layer;
    },

    fitLayerToComp: function (comp, layer, avItem) {
        var h = avItem.height;
        var w = avItem.width;
        var compHeight = comp.height;
        var compWidth = comp.width;
        var scaleWidth = ((100 * 1920) / w);
        var scaleHeight = ((100 * 1080) / h);
        var scale = [100, 100];
        if (h >= w) {
            // scale = [((w * scaleHeight) / h), scaleHeight];
            scale = [scaleHeight, scaleHeight];
        } else {
            // scale = [scaleWidth, ((h * scaleWidth) / w)];
            scale = [scaleWidth, scaleWidth];
        }
        layer.scale.setValue(scale);
    },

    /**
     * Build comp using variables from template and slide config
     */
    buildCompFromTemplate: function (videoFolder, slide, i) {
        var slideData = slide.data;
        var slideType = slideData.slideType;
        var templateName = slideType + '_' + slideData.slideTemplate.name;
        var characters = slideData.slideTemplate.characters;
        var comp = UTILS.findCompByName(UTILS.getFolderByName('Prefabs'), templateName).duplicate();
        var image;
        var imageLayer;
        var video;
        var videoLayer;
        var duration;
        comp.name = 'Comp_' + i;


        /**
         * We may be able to simplifiy the following logic now that we have a "fields" array
         * var fields = slide.data.slideTemplate.fields;
         * for (var i = 0; i < fields.length; i++) {
         *    templates[fields[i]](slide, ...other_options);
         * };
         *
         */

        if (!/bumper|share/.test(templateName)) {
            caption = slide.caption.substr(0, characters.caption);
            if (slideType === 'quotation') {
                caption = '"' + caption + '"';
            }
            UTILS.findLayerByName(comp, 'caption').sourceText.setValue(caption);
        }
        if (slideType === 'image') {
            image = project.importFile(new ImportOptions(File(slide.image)));
            image.parentFolder = videoFolder;
            imageLayer = UTILS.findLayerByName(comp, 'image');
            imageLayer.replaceSource(image, true); // Set image source

            // GIF Handling
            if (slide.image_type === 'gif') {
                try {
                    // need to resize the image beforehand.
                    // this does not work if the comp has a scale transform already applied.
                    this.fitLayerToComp(comp, comp.layer(2), image);
                } catch(e) {
                    //$.writeln(e);
                }
                imageLayer.timeRemapEnabled = true;
                imageLayer.timeRemap.expression = "loopOut('cycle');";
            }
        }
        if (/^joke|quotation|date/.test(templateName)) {
            title = slide.title.substr(0, characters.title);
            if (slideType === 'quotation') {
                title = '- ' + title;
            }
            UTILS.findLayerByName(comp, 'title').sourceText.setValue(title);
        }
        if (slideType === 'video') {
            var positionProperty;
            var keyValues = [];
            var transitionInDuration = slideData.slideTemplate.frames['in'] / fps;
            var transitionOutDuration = slideData.slideTemplate.frames['out'] / fps;
            var captionLayer = UTILS.findLayerByName(comp, 'caption');
            var inPoint = slideData.video.inPoint;
            var outPoint = slideData.video.outPoint;
            video = project.importFile(new ImportOptions(File(slide.video)));
            videoLayer = UTILS.findLayerByName(comp, 'video');
            videoLayer.replaceSource(video, false);
            // comp.duration = video.duration;
            comp.duration = slideData.video.duration;
            duration = outPoint - inPoint;
            videoLayer.inPoint = inPoint;
            videoLayer.outPoint = outPoint;

            captionLayer.inPoint = inPoint;
            captionLayer.outPoint = outPoint;

            positionProperty = videoLayer.position;

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

            try {
            comp.workAreaStart = inPoint;
            comp.workAreaDuration = duration;
        } catch(e) {$.writeln(e)}

        }
        return comp;
    }

};
