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
        this.socket.on('register', (id, version) => {
            console.log('registering new socket id');
            if (__VERSION__ !== version && process.env.NODE_ENV === 'production') {
                if (window.confirm('New Version Available')) {
                    window.location.reload();
                    return;
                }
                this.$destroy();
            }
            this.socket_id = id;
        });
    }
}).$mount('#app'));
