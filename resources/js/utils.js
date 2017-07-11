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
     * Write message to file
     * @param {String} dest
     * @param {String} msg
     * @return {void}
     */
    // https://forums.adobe.com/thread/1166944#access_token=eyJ4NXUiOiJpbXNfbmExLWtleS0xLmNlciIsImFsZyI6IlJTMjU2In0.eyJmZyI6IlJTSjZJWURXN0pQUUNBQUFBQUFBQUFBQVk0PT09PT09IiwiYXMiOiJpbXMtbmExIiwiYyI6InFtZXlYR3ovVnZQb05NMXBvZERBYnc9PSIsInVzZXJfaWQiOiI3NjI3RDM2QjU0NEVBQTgyMEE0Qzk4QTdAQWRvYmVJRCIsIm1vaSI6ImI1YzU1OGZkIiwic2NvcGUiOiJBZG9iZUlELG9wZW5pZCxhZGRpdGlvbmFsX2luZm8uc2NyZWVuX25hbWUsdXBkYXRlX3Byb2ZpbGUuc2NyZWVuX25hbWUiLCJjcmVhdGVkX2F0IjoiMTQ5OTQ1ODgyMDAxMiIsImlkIjoiMTQ5OTQ1ODgyMDAxMi1iMTlkMWQ3Ni04NzM0LTQ4NmQtOTk3Ny1lNmJjNTczMzQxOWQiLCJzdGF0ZSI6IiIsInR5cGUiOiJhY2Nlc3NfdG9rZW4iLCJleHBpcmVzX2luIjoiODY0MDAwMDAiLCJjbGllbnRfaWQiOiJmb3J1bXMyIn0.iAQWdIt_NbaoONHRJrw0AHgmAe1_Fo6_iOAhP0HwCJPhwx0i79XQ8vTGKKavg0DrZLzGPgsgXWsRXzx8k3J6lsmyy_C2bZGsfFnl8dcjSxDmkzgy-ZcnKpIOu-syRfj1mhNc8jSpF2NF-OUv_F9TAVLC79wBFduxgkr_obQi5LRpytVWEN6UxQ6n0ufozRth6ePTRAgHW01JkLxFNqOS-obSnl47mu_84B5ubqeV2UXWeEuJLP__oLqjF8RZyy882fBOHS9aNJtYAWIHSHOj9eVE8YuYpGwP1meyEKWx29MOf2-1LkQ_hSjInToF-z77AwvofIAtX4IAlXin6OWX8g&token_type=bearer&expires_in=86399976
    writeFile: function (dest, msg) {
        var file = new File(dest);
        file.open("e", "TEXT", "????");
        file.writeln(msg);
        file.close();
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
