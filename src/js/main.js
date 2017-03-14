require('../scss/main.scss');

import Vue from 'vue';
import VueResource from 'vue-resource';
import router from './routers/app';

// Components
import appBar from './components/app-bar.vue';

const eventHub = Vue.prototype.eventHub = new Vue(); // Create a new instance of Vue to use as an event hub.

// Register Components
Vue.component('app-bar', appBar);

Vue.use(VueResource);

(new Vue({
    router,
    created() {}
}).$mount('#app'));
