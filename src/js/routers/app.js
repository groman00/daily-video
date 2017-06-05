import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../pages/Home.vue';
import Video from '../pages/Video.vue';
import Uploads from '../pages/Uploads.vue';

Vue.use(VueRouter);

const router = new VueRouter({
    linkActiveClass: 'active',
    routes: [
        { path: '/', name: 'home', component: Home },
        { path: '/home/:page', name: 'home-paginated', component: Home },
        { path: '/video/:id', name: 'video', component: Video }, // change this route name to project?
        { path: '/uploads', name: 'uploads', component: Uploads }
    ]
});

export default router;
