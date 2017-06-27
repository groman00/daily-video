import Vue from 'vue';

/**
 * Vendor Components
 */
Vue.component('vue-slider', require('vue-slider-component'));
Vue.component('draggable', require('vuedraggable'));

/**
 * Custom Components
 */
Vue.component('app-bar', require('./app-bar.vue'));
Vue.component('image-cropper', require('./image-cropper.vue'));
Vue.component('loading-indicator', require('./loading-indicator.vue'));
Vue.component('narration-input', require('./narration-input.vue'));
Vue.component('overlay', require('./overlay.vue'));
Vue.component('progress-bar', require('./progress-bar.vue'));
Vue.component('slide-new', require('./slide-new.vue'));
Vue.component('slide-preview', require('./slide-preview.vue'));
Vue.component('thumbnail', require('./thumbnail.vue'));
Vue.component('video-editor', require('./video-editor.vue'));
Vue.component('video-editor-item', require('./video-editor-item.vue'));
Vue.component('video-toolbar', require('./video-toolbar.vue'));
Vue.component('video-uploader', require('./video-uploader.vue'));
