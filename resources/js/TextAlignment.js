function TextAlignment() {
    var comp;
    var rect;
    var padding = 50;
    var margin = 0;
    this.dictionary = {
        0: ['left', 'top'],
        1: ['center', 'top'],
        2: ['right', 'top'],
        3: ['left', 'middle'],
        4: ['center', 'middle'],
        5: ['right', 'middle'],
        6: ['left', 'bottom'],
        7: ['center', 'bottom'],
        8: ['right', 'bottom']
    };
    this.setComp = function (compItem) {
        comp = compItem;
    };
    this.setRect = function (sourceRect) {
        rect = sourceRect;
    };
    this.alignments = {
        /**
         * @return [{anchorPoint}, {position}]
         */
        top: function () {
            return [
                (rect.top - padding),
                0
            ];
        },
        middle: function () {
            return [
                ((rect.height / 2) + rect.top),
                (comp.height / 2)
            ];
        },
        bottom: function () {
            return [
                ((rect.height + rect.top) + padding),
                comp.height
            ];
        },
        left: function () {
            return [
                (rect.left - padding),
                0
            ];
        },
        center: function () {
            return [
                ((rect.width / 2) + rect.left),
                (comp.width / 2)
            ];
        },
        right: function () {
            return [
                (rect.width + rect.left) + padding,
                comp.width
            ];
        }
    };
}

/**
 * Apply alignment to layer
 * @param  {Integer} alignmentId Alignment code
 * @param  {CompItem} comp
 * @param  {AVItem} layer
 */
TextAlignment.prototype.apply = function (alignmentId, comp, layer) {
    var keys = this.dictionary[alignmentId];
    var alignment;
    if (!keys) {
        return;
    }
    layer.parent = null; // The layer's transform is based on the comp, so remove it from it's current parent.
    this.setComp(comp);
    this.setRect(layer.sourceRectAtTime(0, false));
    alignment = [
        this.alignments[keys[0]](),
        this.alignments[keys[1]]()
    ];
    layer.transform.anchorPoint.setValue([alignment[0][0], alignment[1][0]]);
    layer.transform.position.setValue([alignment[0][1], alignment[1][1]]);
};
