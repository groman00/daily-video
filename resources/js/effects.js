function Effects() {
    this.dictionary = {
        0: 'noop',
        1: 'panZoomIn',
        2: 'panZoomOut',
    };
}

/**/
Effects.prototype.noop = function () {}

/**
 * Apply Ken Burns effect
 * original script: http://www.motionboutique.com/pan-zoom/
 * @param  {AVItem} layer
 * @param  {Number} duration
 * @param  {String} direction   Direction of effect: "in" or "out"
 */
Effects.prototype.panZoom = function (layer, duration, direction) {
    var panZoomStart = 0;
    var panZoomEnd = duration;
    var rulesOfThirdsPoints = [ [1/3, 1/3], [2/3, 1/3], [1/3, 2/3], [2/3, 2/3] ]; // points of interest in image
    var rdIdx = Math.floor(Math.random() * rulesOfThirdsPoints.length);
    var f = rulesOfThirdsPoints[rdIdx];
    var deltaZoomPoint =  [f[0] * layer.width, f[1] * layer.height] - [layer.width/2, layer.height/2];
    var keyTimes = [panZoomStart, panZoomEnd];
    var keyValues = direction === 'in' ? [ [150, 150], [100, 100] ] : [ [100, 100], [150, 150] ];

    layer.anchorPoint.setValue(layer.anchorPoint.value + deltaZoomPoint);
    layer.position.setValue(layer.position.value + deltaZoomPoint);
    layer.scale.setValuesAtTimes(keyTimes, keyValues);
}

/**/
Effects.prototype.panZoomIn = function (layer, duration) {
    this.panZoom(layer, duration, 'in');
}

/**/
Effects.prototype.panZoomOut = function (layer, duration) {
    this.panZoom(layer, duration, 'out');
}

/**
 * Run effect method by number id
 * @param  {Integer} id     Effect key in dictionary
 * @param  {AVItem} layer
 * @param  {Number} duration layer duration
 */
Effects.prototype.applyEffect = function (id, layer, duration) {
    var func = this.dictionary[id];
    if (!func) {
        return;
    }
    this[func].apply(this, [layer, duration]);
};


