var UTILS = {

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
        comp.name = 'Comp_' + i;
        if (!/bumper|share/.test(templateName)) {
            caption = slide.caption.substr(0, characters.caption);
            if (slideType === 'quotation') {
                caption = '"' + caption + '"';
            }
            comp.layer(1).sourceText.setValue(caption); // Set text layer sourceText
        }
        if(slideType === 'image') {
            image = project.importFile(new ImportOptions(File(slide.image)));
            image.parentFolder = videoFolder;
            comp.layer(2).replaceSource(image, true); // Set image source

            // GIF Handling
            if (slide.image_type === 'gif') {
                try {
                    // need to resize the image beforehand.
                    // this does not work if the comp has a scale transform already applied.
                    this.fitLayerToComp(comp, comp.layer(2), image);
                } catch(e) {
                    //$.writeln(e);
                }
                comp.layer(2).timeRemapEnabled = true;
                comp.layer(2).timeRemap.expression = "loopOut('cycle');";
            }
        }
        if (/^joke|quotation|date/.test(templateName)) {
            title = slide.title.substr(0, characters.title);
            if (slideType === 'quotation') {
                title = '- ' + title;
            }
            comp.layer(2).sourceText.setValue(title); // Set text layer sourceText
        }
        return comp;
    }

};
