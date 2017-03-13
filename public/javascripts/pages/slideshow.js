/**
 * Video Generator
 */

(function (window, $) {

    "use strict";

    Date.prototype.getMonthText = function() {
        var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        return months[this.getMonth()];
    }

    function Generator() {
        this.$carousel = $('#slideshow-carousel');
        this.$form = $('#generator');
        this.$submitButton = $('#submit-button');
        this.$fileInput = this.$form.find('input[name="audio"]');
        this.$indicator = $('#progressIndicator').progressIndicator();
        this.$downloadLink = $('#videoDownload');
        this.$audioLength = $('#recommendedAudioLength');

        this.config = this.parseConfig();
        // this.VIDEO_TIME = 20 // in seconds
        this.VIDEO_TIME = 120 // This should be determined by the frames set in slide template config
        this.imageCount = this.$carousel.find('.item').length;
        this.slideDuration = Math.ceil(this.VIDEO_TIME / this.imageCount);

        this.realVideoDuration = 0;
        // this.realVideoDuration = this.slideDuration * this.imageCount;


        console.log(this.realVideoDuration);

        this.init();
        if (APP.socket) {
            this.bindSocketEvents(APP.socket);
        }
    }

    $.extend(Generator.prototype, {

        parseConfig: function() {
            // Convert templates array into object with keys
            var config = window.videoConfig;
            config.templates = config.templates.reduce(function (acc, template) {
                acc[template.name] = template;
                return acc;
            }, {});
            return config;
        },
        init: function () {
            this.$form.on('submit', this.submit.bind(this));
            this.$audioLength.text('Note: audio should be less than ' + this.realVideoDuration + ' seconds in length');
            this.$carousel.carousel({
                // interval: false
                interval: this.slideDuration * 1000 // Need to tweak this so it matches template config
            });
            this.presetSlideTemplates();
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

        presetSlideTemplates: function() {
            // Preselect template based on slide type
            this.$carousel.find('.item').each(function (i, slide) {
                $(slide).find('select').val(function () {
                    switch ($(slide).data('type')) {
                        case 'quote':
                            return 'quote';
                            break;
                        case 'text':
                            return 'title_1';
                            break;
                        case 'image':
                        return 'slide_in_out';
                            break;
                        default:
                            return 'share';
                    }
                }).trigger('change');
            });
        },

        getSlidesData: function () {
            // todo: Clean this up
            // Create array of image objects for POST
            var templates = this.config.templates;
            var slideData, template;
            var now = new Date();
            var data = this.$carousel.find('.item').map(function (i, slide) {
                template = templates[$(slide).find('select').val()];
                slideData = [{
                    image: $(slide).children('img').attr('src'),
                    title: $(slide).children('.carousel-title').text(),
                    caption: $(slide).children('.carousel-caption').text(),
                    template: template
                }];
                if ($(slide).find('input[type="checkbox"]').is(':checked')) {
                    slideData.unshift({
                        template: templates['bumper']
                    });
                }
                if (template.name === 'joke') {
                    slideData.unshift({
                        template: templates['bumper_joke']
                    });
                }
                return slideData;
            }.bind(this)).toArray();

            // todo: add special bumper before joke slide
            data.splice(1, 0, {
                template: templates['date'],
                title: now.getDate(),
                caption: now.getMonthText().toUpperCase(),
            })

            data.push({
                template: templates['share']
            });

            return data;
        },

        submit: function (e) {
            var formData = new FormData();
            var slideData = this.getSlidesData();
            var frames;
            var file;
            var totalFrames = slideData.reduce(function (acc, data) {
                frames = data.template.frames;
                return acc + (frames.total - frames.out);
            }, 0);

            //console.log(JSON.stringify(this.getSlidesData()));
            console.log(this.getSlidesData());

            // this.toggleFormEnabled(false);
            file = this.$fileInput[0].files[0];
            formData.append('socket_id', APP.socket_id);
            formData.append('fps', this.config.fps);
            formData.append('slides', JSON.stringify(slideData));
            formData.append('videoDuration', (totalFrames / this.config.fps));
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