import VueRouter from 'vue-router';

var instance;

function Api() {
    var host = '/api';
    var match;
    this.router = new VueRouter({
        routes: [
            // todo: eventually rename all "slideshow" endpoints to "project"
            { path: host + '/slideshows', name: 'slideshows' },
            { path: host + '/slideshows/create', name: 'create-project' },
            { path: host + '/slideshows/slide/add', name: 'slideshows-add-slide' },
            { path: host + '/slideshows/slide/save', name: 'slideshows-save-slide' },
            { path: host + '/slideshows/slide/delete', name: 'slideshows-delete-slide' },
            { path: host + '/slideshows/:id', name: 'slideshow' },
            { path: host + '/preview-slide', name: 'preview-slide' },
            { path: host + '/save-project', name: 'save-project' },
            { path: host + '/render-project', name: 'render-project' },
            { path: host + '/vidible-upload', name: 'vidible-upload' },
            { path: host + '/vidible-uploads', name: 'vidible-uploads' },
            { path: host + '/project-config', name: 'project-config' }
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
