import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../pages/Home.vue';
import Video from '../pages/Video.vue';
import VideoNew from '../pages/VideoNew.vue';
import Uploads from '../pages/Uploads.vue';

Vue.use(VueRouter);

const router = new VueRouter({
    linkActiveClass: 'active',
    routes: [
        { path: '/', name: 'home', component: Home },
        { path: '/video/new', name: 'video-new', component: VideoNew },
        { path: '/video/:id', name: 'video', component: Video },
        { path: '/uploads', name: 'uploads', component: Uploads }
    ]
});

export default router;
