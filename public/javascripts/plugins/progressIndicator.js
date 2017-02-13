/**
 * Progress indicator
 */
(function (window, $) {

    "use strict";

    var pluginName = "progressIndicator";
    var defaults = {};

    function Plugin (element, options) {
        this.settings = $.extend( {}, defaults, options );
        this.el = element;
        this.$el = $(this.el);
        this.$label = this.$el.find('.progress-label');
        this.$track = this.$el.find('.progress');
        this.$bar = this.$el.find('.progress-bar');
        this.init();
    }

    $.extend(Plugin.prototype, {
        init: function () {
            this.$el
                // Handle all bound events and pass through args
                .on('show hide animate indeterminate error progress complete reset', function () {
                    var args = arguments;
                    this[Array.prototype.shift.call(args).type].apply(this, args);
                }.bind(this));
        },
        updateBarProgress: function (progress) {
            var value = Math.ceil(progress * 100) + '%';
            this.updateBar(value, value);
        },
        updateBar: function (width, text) {
          this.$bar
            .css({ width: width })
            .text(text);
        },
        updateLabel: function (message) {
            this.$label.text(message);
        },
        show: function () {
            this.animate(true);
            this.$el.removeClass('hide');
        },
        hide: function () {
            this.$el.addClass('hide');
            this.animate(false);
        },
        animate: function (bool) {
            this.$bar.toggleClass('active', bool);
        },
        indeterminate: function (message) {
            this.updateBar('100%', '');
            this.updateLabel(message);
            this.show();
        },
        error: function (message) {
            this.updateBar(0, '');
            this.updateLabel(message);
        },
        progress: function (data) {
            this.updateBarProgress(data.progress);
            this.updateLabel(data.message);
        },
        complete: function (message) {
            this.updateBarProgress(1)
            this.updateLabel(message);
        },
        reset: function () {
            this.hide();
            this.updateBar(0, '');
            this.updateLabel('');
        }
    });

    $.fn[pluginName] = function(options) {
        return this.each( function() {
            if (!$.data(this, pluginName)) {
                $.data( this, pluginName, new Plugin(this, options));
            }
        });
    };

}(window, jQuery));
