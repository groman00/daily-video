import VueRouter from 'vue-router';

var instance;

function Api() {
    var host = '/api';
    var match;
    this.router = new VueRouter({
        routes: [
            { path: host + '/slideshows', name: 'slideshows' },
            { path: host + '/slideshows/:id', name: 'slideshow' },
            { path: host + '/generate-video', name: 'generate-video' },
            { path: host + '/generate-slide-preview', name: 'generate-slide-preview' }
        ]
    });
    this.route = function (name = '', params = {}) {
        return this.router.match({
            'name': name,
            'params': params
        }).path;
    };
}

function Singleton() {
    if (instance === undefined) {
        instance = new Api();
    }
    return instance;
}

export default new Singleton();
