(function (window, $) {
    var $carousel = $('#slideshow-carousel');
    var $form = $('#generator')
        .on('submit', submit);
    var $submitButton = $('#submit-button');
    var $fileInput = $form.find('input[name="audio"]');
    var $progressBar = $('#form-progress-bar');
    var $progressLabel = $('#form-progress-label');
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
                path: $(this).children('img').attr('src'),
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
        if (file){
            formData.append('audio', file, file.name);
        }
        // formData.append('socket_id', APP.socket_id);
        formData.append('slides', JSON.stringify(getSlidesData()));
        formData.append('videoDuration', realVideoDuration);
        formData.append('slideDuration', slideDuration);
        formData.append('timestamp', '_' + new Date().getTime());

        $.ajax({
            type: 'POST',
            contentType: false,
            processData: false,
            url: '/generate-video',
            data: formData,
            success: function(){
                console.log(arguments)
                enable(true);
            }
        });

        return false;
    }

}(window, jQuery));
