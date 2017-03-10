/**
 * Video Generator
 */
(function (window, $) {

    "use strict";

    function Generator() {
        this.$carousel = $('#slideshow-carousel');
        this.$form = $('#generator');
        this.$submitButton = $('#submit-button');
        this.$fileInput = this.$form.find('input[name="audio"]');
        this.$indicator = $('#progressIndicator').progressIndicator();
        this.$downloadLink = $('#videoDownload');
        this.$audioLength = $('#recommendedAudioLength');

        this.config = window.videoConfig;
        this.VIDEO_TIME = 20 // in seconds
        this.imageCount = this.$carousel.find('.item').length;
        this.slideDuration = Math.ceil(this.VIDEO_TIME / this.imageCount);
        this.realVideoDuration = this.slideDuration * this.imageCount;
        this.init();
        if (APP.socket) {
            this.bindSocketEvents(APP.socket);
        }
    }

    $.extend(Generator.prototype, {

        init: function () {
            this.$form.on('submit', this.submit.bind(this));
            this.$audioLength.text('Note: audio should be less than ' + this.realVideoDuration + ' seconds in length');
            this.$carousel.carousel({
                interval: this.slideDuration * 1000
            });
        },

        bindSocketEvents(socket) {
            socket.on('progress', function (data) {
                if (!data.progress) {
                    this.$indicator.trigger('indeterminate', [data.message]);
                } else {
                    this.$indicator.trigger('progress', [data])
                }
            }.bind(this));
            socket.on('complete', function (data) {
                this.$indicator.trigger('complete', ['Video Completed']);
                this.$downloadLink
                    .attr('href', data.file)
                    .removeClass('hide');
                setTimeout(function () {
                    this.reset();
                }.bind(this), 1000);
            }.bind(this));
            socket.on('jobError', function (message) {
                console.log('error', message);
                this.$indicator.trigger('error', ['Unexpected Error: Please refresh and try again.']);
            }.bind(this));
        },

        reset: function () {
            this.$indicator.trigger('reset');
            this.toggleFormEnabled(true);
            this.$fileInput.val('');
        },

        toggleFormEnabled: function (bool) {
            this.$submitButton.prop('disabled', !bool);
            this.$fileInput.prop('disabled', !bool);
        },

        getSlidesData: function () {
            // Create array of image objects for POST
            return this.$carousel.find('.item').map(function (i, slide) {
                return {
                    image: $(slide).children('img').attr('src'),
                    caption: $(slide).children('.carousel-caption').text(),
                    template: this.config.templates[$(slide).children('select').prop('selectedIndex')]
                }
            }.bind(this)).toArray();
        },

        submit: function (e) {
            var formData = new FormData();
            var file;
            // this.toggleFormEnabled(false);
            file = this.$fileInput[0].files[0];
            formData.append('socket_id', APP.socket_id);
            formData.append('fps', this.config.fps);
            formData.append('slides', JSON.stringify(this.getSlidesData()));
            formData.append('videoDuration', this.realVideoDuration);
            formData.append('slideDuration', this.slideDuration);
            formData.append('timestamp', '_' + new Date().getTime());
            if (file){
                formData.append('audio', file, file.name);
            }
            $.ajax({
                type: 'POST',
                contentType: false,
                processData: false,
                url: '/generate-video',
                data: formData,
                beforeSend: function () {
                    this.$indicator.trigger('indeterminate', ['Uploading...']);
                }.bind(this),
                success: function(){
                    console.log(arguments)
                }
            });
            return false;
        }

    });

    var generator = new Generator();

}(window, jQuery));