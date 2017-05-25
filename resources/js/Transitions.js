function Transitions() {
    this.transitionDuration = UTILS.framesToSeconds(10); // All transitions are 10 frames
    this.dictionary = {
        0: "noop",
        1: "slideIn",
        2: "slideOut",
        3: "slideInOut"
    };
}

/**
 * Apply Transition to slide
 * @param  {Renderer} renderer
 */
Transitions.prototype.apply = function(renderer) {
    var fn = this.dictionary[renderer.data.transition];
    if (!fn) {
        return;
    }
    // Perform transition.  Pass a simplified object with data from renderer instance.
    this[fn].apply(this, [
        {
            position: renderer.transitionLayer.position,
            duration: renderer.duration,
            width: renderer.comp.width,
            anchorPoint: (renderer.comp.width / 2)
        }
    ]);
};

/**
 * No Operation
 */
Transitions.prototype.noop = function () {}

/**
 * Slide In
 * @param  {Object} data
 */
Transitions.prototype.slideIn = function(data) {
    var anchorPoint = data.anchorPoint;
    data.position.setValueAtTime(0, [anchorPoint + data.width, anchorPoint]);
    data.position.setValueAtTime(this.transitionDuration, [anchorPoint, anchorPoint]);
}

/**
 * Slide Out
 * @param  {Object} data
 */
Transitions.prototype.slideOut = function(data) {
    var anchorPoint = data.anchorPoint;
    var slideDuration = data.duration;
    data.position.setValueAtTime(slideDuration - this.transitionDuration, [anchorPoint, anchorPoint]);
    data.position.setValueAtTime(slideDuration, [-1 * anchorPoint, anchorPoint]);
}

/**
 * Slide In/Out
 * @param  {Object} data
 */
Transitions.prototype.slideInOut = function(data) {
    this.slideIn(data);
    this.slideOut(data);
}
