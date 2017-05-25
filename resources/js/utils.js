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
     * For themes with watermarks, apply the watermark comp to the final video comp.
     * @param  {CompItem} comp
     * @param  {Object} config
     */
    applyWatermark: function (comp, config) {
        var duration = comp.duration;
        var watermarkFolder = this.getFolderByName('watermark', this.getFolderByName('Precomps'));
        var watermark = this.findCompByName(watermarkFolder, config.theme)
        var layer;
        if (watermark) {
            layer = watermark.layer(1);
            watermark.width = (config.format === 'square') ? 1080 : 1920;
            watermark.duration = duration;
            layer.position.setValue([watermark.width - 50, 50])
            layer.outPoint = duration;
            comp.layers.add(watermark);
            watermark.duration = duration;
        }
    }
};
