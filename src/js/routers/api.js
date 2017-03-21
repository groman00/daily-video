import VueRouter from 'vue-router';

var instance;

function Api() {
    var host = '/api';
    var match;
    this.router = new VueRouter({
        routes: [
            { path: host + '/slideshows', name: 'slideshows' },
            { path: host + '/slideshows/:id', name: 'slideshow' },
            { path: host + '/preview-slide', name: 'preview-slide' },
            { path: host + '/save-project', name: 'save-project' },
            { path: host + '/render-project', name: 'render-project' }
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
