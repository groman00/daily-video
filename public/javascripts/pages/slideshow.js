(function (window, $) {
    var $refs = {};
    $refs.form = $('#generator');
    $refs.form.on('submit', function () {
        $.ajax({
            type: 'POST',
            url: '/generate-video',
            data: {},
            success: function(){
                console.log('complete', arguments)
            }
        });
        return false;
    });
}(window, jQuery));
