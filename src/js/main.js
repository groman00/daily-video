require('../scss/main.scss');

import Vue from 'vue';
import VueResource from 'vue-resource';
import router from './routers/app';

// Components
import appBar from './components/app-bar.vue';
import thumbnail from './components/thumbnail.vue';
import loadingIndicator from './components/loading-indicator.vue';

const eventHub = Vue.prototype.eventHub = new Vue(); // Create a new instance of Vue to use as an event hub.

// Register Components
Vue.component('app-bar', appBar);
Vue.component('thumbnail', thumbnail);
Vue.component('loading-indicator', loadingIndicator);

Vue.use(VueResource);

(new Vue({
    router,
    created() {}
}).$mount('#app'));
