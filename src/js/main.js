require('../scss/main.scss');

import Vue from 'vue';
import VueResource from 'vue-resource';
import router from './routers/app';

// Components
import appBar from './components/app-bar.vue';
import thumbnail from './components/thumbnail.vue';
import loadingIndicator from './components/loading-indicator.vue';
import progressBar from './components/progress-bar.vue';
import videoPreview from './components/video-preview.vue';
import slidePreview from './components/slide-preview.vue';
import videoEditor from './components/video-editor.vue';
import videoEditorItem from './components/video-editor-item.vue';
import videoToolbar from './components/video-toolbar.vue';

const eventHub = Vue.prototype.eventHub = new Vue(); // Create a new instance of Vue to use as an event hub.

Date.prototype.getMonthText = function() {
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months[this.getMonth()];
}

// Register Components
Vue.component('app-bar', appBar);
Vue.component('thumbnail', thumbnail);
Vue.component('loading-indicator', loadingIndicator);
Vue.component('progress-bar', progressBar);
Vue.component('video-preview', videoPreview);
Vue.component('slide-preview', slidePreview);
Vue.component('video-editor', videoEditor);
Vue.component('video-editor-item', videoEditorItem);
Vue.component('video-toolbar', videoToolbar);

Vue.use(VueResource);

(new Vue({
    router,
    created() {
        this.socket = io();
        this.socket.on('register', (id) => {
            this.socket_id = id;
        });
    }
}).$mount('#app'));
