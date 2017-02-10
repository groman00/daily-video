/**
 * Upload Form
 */
(function (window, $) {
    var $carousel = $('#slideshow-carousel');
    var $form = $('#generator')
        .on('submit', submit);
    var $submitButton = $('#submit-button');
    var $fileInput = $form.find('input[name="audio"]');
    var $indicator = $('#progressIndicator').progressIndicator();
    var $videoDownload = $('#videoDownload');

    // var VIDEO_TIME = 120 // in seconds
    var VIDEO_TIME = 20 // in seconds
    var imageCount = $carousel.find('.item').length;
    var slideDuration = Math.ceil(VIDEO_TIME / imageCount);
    var realVideoDuration = slideDuration * imageCount;

    $('#recommendedAudioLength').text('Note: audio should be less than ' + realVideoDuration + ' seconds in length');

    $carousel.carousel({
        interval: slideDuration * 1000
    });

    APP.socket.on('progress', function(data){
        if (!data.progress) {
            $indicator.trigger('indeterminate', [data.message]);
        } else {
            $indicator.trigger('progress', [data])
        }
    });

    APP.socket.on('complete', function(){
        $indicator.trigger('complete', ['Video Completed']);
    });

    APP.socket.on('error', function(message){
        $indicator.trigger('error', [message]);
    });


    function enable(bool) {
        $submitButton.prop('disabled', !bool);
        $fileInput.prop('disabled', !bool);
        // $videoDownload
        //     .attr('href', '')
        //     .addClass('hide');
    }

    function getSlidesData() {
        // Create array of image objects for POST
        return $carousel.find('.item').map(function () {
            return {
                image: $(this).children('img').attr('src'),
                caption: $(this).children('.carousel-caption').text(),
                template: 'Template_1'
            }
        }).toArray();
    }

    function submit(e) {
        var formData = new FormData();
        var file;
        enable(false);
        // console.log(slides);
        file = $fileInput[0].files[0];
        formData.append('socket_id', APP.socket_id);
        formData.append('slides', JSON.stringify(getSlidesData()));
        formData.append('videoDuration', realVideoDuration);
        formData.append('slideDuration', slideDuration);
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
                $indicator.trigger('indeterminate', ['Uploading...']);
            },
            success: function(){
                console.log(arguments)
                // enable(true);
            }
        });

        return false;
    }

}(window, jQuery));
