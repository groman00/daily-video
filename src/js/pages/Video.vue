<style scoped></style>
<template>
    <div class="video-page page-wrapper">
        <app-bar :config="{ buttonLeft: 'back', title: slideshow.title }" @titleUpdated="titleUpdated"></app-bar>
        <div v-if="slideshow" class="flex-columns flex-grow-1">
            <div class="panels-top flex-rows flex-grow-1">
                <div class="panel-left">
                    <video-editor :slideshowId="slideshow.id" :slides="slides" :slideTypes="slideTypes" :theme="theme"></video-editor>
                </div>
                <div class="panel-right">
                    <slide-preview></slide-preview>
                </div>
            </div>
            <div class="panels-bottom flex-shrink-1">
                <video-toolbar ref="videoToolbar" :onSubmit="renderProject" :onSave="saveProject" :slideshow="slideshow" :themes="themes" @themeUpdated="themeUpdated"></video-toolbar>
            </div>
        </div>
        <loading-indicator v-else></loading-indicator>
    </div>
</template>
<script>
    import api from '../routers/api';
    import { framesToSeconds } from '../lib/helpers';

    export default {
        data() {
            return {
                theme: '',
                themes: ['AOL', 'AOLComms', 'HuffingtonPost', 'Moviefone', 'Alpha'],
                slides: [],
                fps: 0,
                slideTypes: {},
                slideshow: {}
            }
        },
        created() {
            this.fetchData();
            this.eventHub.$on('slide-added', this.addSlide);
            this.eventHub.$on('slide-removed', this.removeSlide);
            this.eventHub.$on('slide-updated', this.updateSlide);
            this.eventHub.$on('slide-moved', this.moveSlide);
        },
        beforeDestroy() {
            this.eventHub.$off('slide-added', this.addSlide);
            this.eventHub.$off('slide-removed', this.removeSlide);
            this.eventHub.$off('slide-updated', this.updateSlide);
            this.eventHub.$off('slide-moved', this.moveSlide);
        },
        methods: {
            titleUpdated(title) {
                this.slideshow.title = title;
                this.saveSlideshow();
            },
            themeUpdated(theme) {
                this.theme = theme;
                console.log('theme updated', theme);
            },
            fetchData() {
                let body;
                let slides;
                this.$http.get(api.route('slideshow', { id: this.$route.params.id }))
                    .then((response) => {
                        body = response.body;
                        this.slideshow = body.slideshow;
                        this.slideTypes = body.config.slideTypes;
                        this.fps = body.config.fps;
                        this.slides = this.slideshow.slides;
                    }, (response) => {
                        // console.log('error', response);
                    });
            },
            addSlide(slide) {
                this.slides.push(slide);
            },
            removeSlide(removedSlide) {
                this.slides = this.slides.filter((slide) => {
                    return slide.id != removedSlide.id;
                });
            },
            moveSlide(from, to) {
                this.slides.splice(to, 0, this.slides.splice(from, 1)[0] );
            },
            updateSlide(updatedSlide) {
                const index = this.slides.findIndex((slide) => {
                    return slide.id === updatedSlide.id;
                });
                this.$set(this.slides, index, Object.assign({}, this.slides[index], updatedSlide));
            },
            saveSlideshow() {
                console.log(this.slideshow);
                this.$http.post(api.route('slideshows-save'), this.slideshow)
                    .then((response) => {
                        console.log(response);
                    }, (response) => {
                        console.log('error', response);
                    });
            },
            getFormData(settings) {
                let frames;
                const formData = new FormData();
                const narrationTrack = settings.narrationTrack;
                const audioTrack = settings.audioTrack;
                const videoDuration = this.slides.reduce(function (acc, slide) {
                    frames = slide.data.slideTemplate.frames;
                    return acc + ((slide.data.duration || framesToSeconds(frames.total)) - framesToSeconds(frames.out));
                }, 0);
                formData.append('slideshowId', this.$route.params.id);
                formData.append('title', this.slideshow.title);
                formData.append('socket_id', this.$root.socket_id);
                formData.append('fps', this.fps);
                formData.append('slides', JSON.stringify(this.slides));
                formData.append('videoDuration', videoDuration);
                formData.append('preview', settings.isPreview);
                formData.append('audioTrack', settings.audioTrack);
                formData.append('audioTrackLevel', settings.audioTrackLevel);
                formData.append('narrationTrackLevel', settings.narrationTrackLevel);
                formData.append('theme', this.theme);
                if (narrationTrack){
                    formData.append('narrationTrack', narrationTrack, narrationTrack.name);
                }
                return formData;
            },
            renderProject(settings) {
                this.$http.post(api.route('render-project'), this.getFormData(settings))
                    .then((response) => {
                        console.log(response);
                    }, (response) => {
                        console.log('error', response);
                    });
                return false;
            },
            saveProject(settings) {
                /*
                this.$http.post(api.route('save-project'), this.getFormData(settings))
                    .then((response) => {
                        console.log('project saved', response);
                        alert('Saved!');
                    }, (response) => {
                        console.log('error saving', response);
                    });
                */
            }

        }
    }
</script>
