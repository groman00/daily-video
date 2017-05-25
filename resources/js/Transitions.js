function Transitions() {
    this.td = UTILS.framesToSeconds(10); // All transitions are 10 frames
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
Transitions.prototype.apply = function (renderer) {
    var fn = this.dictionary[renderer.data.transition];
    if (!fn) {
        return;
    }

    // All transitions will respond with in/out duration values.  These will be used in final video sequencing.
    function response (durations) {
        var d = durations;
        if (!d) {
            d = [0, 0];
        }
        return {
            'in': d[0],
            'out': d[1]
        }
    };

    // Perform transition.  Pass a simplified object with data from renderer instance.
    return response(this[fn].apply(this, [
        {
            'position': renderer.transitionLayer.position,
            'duration': renderer.duration,
            'width': renderer.comp.width,
            'anchorPoint': {
                x: (renderer.comp.width / 2),
                y: 540
            }
        }
    ]))

};

/**
 * No Operation
 */
Transitions.prototype.noop = function () {
    return null;
}

/**
 * Slide In
 * @param  {Object} data
 */
Transitions.prototype.slideIn = function(data) {
    var anchorPoint = data.anchorPoint;
    data.position.setValueAtTime(0, [anchorPoint.x + data.width, anchorPoint.y]);
    data.position.setValueAtTime(this.td, [anchorPoint.x, anchorPoint.y]);
    return [this.td, 0];
}

/**
 * Slide Out
 * @param  {Object} data
 */
Transitions.prototype.slideOut = function(data) {
    var anchorPoint = data.anchorPoint;
    var slideDuration = data.duration;
    data.position.setValueAtTime(slideDuration - this.td, [anchorPoint.x, anchorPoint.y]);
    data.position.setValueAtTime(slideDuration, [-1 * anchorPoint.x, anchorPoint.y]);
    return [0, this.td];
}

/**
 * Slide In/Out
 * @param  {Object} data
 */
Transitions.prototype.slideInOut = function(data) {
    this.slideIn(data);
    this.slideOut(data);
    return [this.td, this.td];
}
