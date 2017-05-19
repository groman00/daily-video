var fps = 29.97;
var UTILS = {

    /**
     * Convert number of frames to seconds
     * @param  {int} frames
     * @return {Number}
     */
    framesToSeconds: function (frames) {
        return Math.round(100 * (frames / fps)) / 100;
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
        return project.items.addComp(name, 1920, 1080, 1.0, duration, fps);
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
     * @param  {FolderItem} parent
     * @return {FolderItem}
     */
    getFolderByName: function (name, parent) {
        var folder, i;
        if (!parent) {
            parent = project;
        }
        for (i = 1; i <= parent.numItems; i ++) {
            if ((parent.item(i) instanceof FolderItem) && (parent.item(i).name === name)) {
                folder = parent.item(i);
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
            scale = [scaleHeight, scaleHeight];
        } else {
            scale = [scaleWidth, scaleWidth];
        }
        layer.scale.setValue(scale);
    },

    /**
     * For brands with watermarks, apply the watermark comp to the final video comp.
     * @param  {CompItem} comp
     * @param  {String} brand
     * @param  {Number} duration
     */
    applyWatermark: function (comp, brand, duration) {
        var watermarkFolder = this.getFolderByName('watermark', this.getFolderByName('Precomps'));
        var watermark = this.findCompByName(watermarkFolder, brand)
        if (watermark) {
            watermark.duration = duration;
            watermark.layer(1).outPoint = duration;
            comp.layers.add(watermark);
            watermark.duration = duration;
        }
    },

    /**
     * Apply Ken Burns effect
     * @param  {CompItem} comp
     * @param  {AVItem} layer
     * @param  {Number} duration
     * @param  {String} mode    direction of effect: "IN" or "OUT"
     */
    applyPanZoom: function (comp, layer, duration, mode) {
        var panZoomStart = 0;
        var panZoomEnd = duration;
        var rulesOfThirdsPoints = [ [1/3,1/3], [2/3,1/3], [1/3,2/3], [2/3,2/3] ]; // points of interest in image
        var zoomMode = mode;
        var rdIdx = Math.floor(Math.random() * rulesOfThirdsPoints.length);
        var f = rulesOfThirdsPoints[rdIdx];
        // Do we need the comp, or can we just use the layer height/width????
        var deltaZoomPoint =  [f[0] * comp.width, f[1] * comp.height] - [comp.width/2, comp.height/2];
        var keyTimes = [panZoomStart, panZoomEnd];
        var keyValues = mode === 'IN' ? [ [150,150], [100,100] ] : [ [100,100], [150,150] ];

        layer.anchorPoint.setValue(layer.anchorPoint.value + deltaZoomPoint);
        layer.position.setValue(layer.position.value + deltaZoomPoint);
        layer.scale.setValuesAtTimes(keyTimes, keyValues);
    }

};
