require('../scss/main.scss');
require('./components');

import Vue from 'vue';
import VueResource from 'vue-resource';
import router from './routers/app';

const eventHub = Vue.prototype.eventHub = new Vue(); // Create a new instance of Vue to use as an event hub.

Vue.use(VueResource);

(new Vue({
    router,
    created() {
        this.socket = io();
        this.socket.on('register', (id) => {
            console.log('registering new socket id');
            this.socket_id = id;
        });
    }
}).$mount('#app'));
