function Alignment() {
    var rect;
    var comp;
    var padding = 50;
    var margin = 0;
    this.anchors = {};
    this.positions = {};
    this.dictionary = {
        0: "topLeft",
        1: "topCenter",
        2: "topRight",
        3: "middleLeft",
        4: "middleCenter",
        5: "middleRight",
        6: "bottomLeft",
        7: "bottomCenter",
        8: "bottomRight"
    };

    this.setRect = function (sourceRect) {
        rect = sourceRect;
    };
    this.setComp = function (compItem) {
        comp = compItem;
    };
    this.setAnchors = function () {
        this.anchors = {
            top: (rect.top - padding),
            middle: ((rect.height / 2) + rect.top),
            bottom: ((rect.height + rect.top) + padding),
            left: (rect.left - padding),
            center: ((rect.width / 2) + rect.left),
            right: (rect.width + rect.left)
        };
    };
    this.setPositions = function () {
        this.positions = {
            top: 0,
            middle: (comp.height / 2),
            bottom: comp.height,
            left: 0,
            center: (comp.width / 2),
            right: comp.width
        };
    };
}

/**
 * Apply alignment to layer
 * @param  {Integer} alignmentId Alignment code
 * @param  {CompItem} comp
 * @param  {AVItem} layer
 */
Alignment.prototype.apply = function (alignmentId, comp, layer) {
    var fn = this.dictionary[alignmentId];
    var alignment = {};
    if (!fn) {
        return;
    }
    this.setRect(layer.sourceRectAtTime(0, false));
    this.setComp(comp);
    this.setAnchors();
    this.setPositions();
    alignment = this[fn].apply(this, []);
    layer.transform.anchorPoint.setValue(alignment[0]);
    layer.transform.position.setValue(alignment[1]);
};

/**/
Alignment.prototype.topLeft = function() {
    return [
        [this.anchors.left, this.anchors.top],
        [this.positions.left, this.positions.top]
    ];
};

/**/
Alignment.prototype.topCenter = function() {
    return [
        [this.anchors.center, this.anchors.top],
        [this.positions.center,this.positions.top]
    ];
};

/**/
Alignment.prototype.topRight = function() {
    return [
        [this.anchors.right, this.anchors.top],
        [this.positions.right, this.positions.top]
    ];
};

/**/
Alignment.prototype.middleLeft = function() {
    return [
        [this.anchors.left, this.anchors.middle],
        [this.positions.left, this.positions.middle]
    ];
};

/**/
Alignment.prototype.middleCenter = function() {
    return [
        [this.anchors.center, this.anchors.middle],
        [this.positions.center, this.positions.middle]
    ];
};

/**/
Alignment.prototype.middleRight = function() {
    return [
        [this.anchors.right, this.anchors.middle],
        [this.positions.right, this.positions.middle]
    ];
};

/**/
Alignment.prototype.bottomLeft = function() {
    return [
        [this.anchors.left, this.anchors.bottom],
        [this.positions.left, this.positions.bottom]
    ];
};

/**/
Alignment.prototype.bottomCenter = function() {
    return [
        [this.anchors.center, this.anchors.bottom],
        [this.positions.center, this.positions.bottom]
    ];
};

/**/
Alignment.prototype.bottomRight = function() {
    return [
        [this.anchors.right, this.anchors.bottom],
        [this.positions.right, this.positions.bottom]
    ];
};
