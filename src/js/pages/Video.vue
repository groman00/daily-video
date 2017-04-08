<style scoped></style>
<template>
    <div class="video-page page-wrapper">
        <app-bar :config="{ buttonLeft: 'back', title: slideshow.title }" v-on:titleUpdated="titleUpdated" :onBackButton="goBack"></app-bar>
        <div v-if="slideshow" class="flex-columns flex-grow-1">
            <div class="panels-top flex-rows flex-grow-1">
                <div class="panel-left">
                    <video-editor :slideshowId="slideshow.id" :slides="slides" :slideTypes="slideTypes"></video-editor>
                </div>
                <div class="panel-right">
                    <slide-preview></slide-preview>
                </div>
            </div>
            <div class="panels-bottom flex-shrink-1">
                <video-toolbar ref="videoToolbar" :onSubmit="renderProject" :onSave="saveProject" :slideshow="slideshow"></video-toolbar>
            </div>
        </div>
        <loading-indicator v-else></loading-indicator>
    </div>
</template>
<script>
    import api from '../routers/api';

    export default {
        data() {
            return {
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
        },
        beforeDestroy() {
            this.eventHub.$off('slide-added', this.addSlide);
            this.eventHub.$off('slide-removed', this.removeSlide);
        },
        methods: {
            titleUpdated(title) {
                this.slideshow.title = title;
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
            /**
             * Merge bumpers, dates, etc into slide data for upload
             * @return {Array}
             */
            /*
            mergeDefaultSlides() {
                const templates = this.templates;
                const slides = [];
                const now = new Date();
                Object.assign([], this.slides).forEach((slide, index) => {
                    if (slide.bumper) {
                        slides.push({
                            template: templates['bumper']
                        });
                    }
                    if (slide.template.name === 'joke') {
                        slides.push({
                            template: templates['bumper_joke']
                        });
                    }
                    slides.push(slide);
                });
                slides.splice(1, 0, {
                    template: templates['date'],
                    title: now.getDate().toString(),
                    caption: now.getMonthText().toUpperCase(),
                });
                slides.push({
                    template: templates['share']
                });
                return slides;
            },
            */

            getFormData(settings) {
                let frames;
                const formData = new FormData();
                const narrationTrack = settings.narrationTrack;
                const audioTrack = settings.audioTrack;
                const totalFrames = this.slides.reduce(function (acc, slide) {
                    frames = slide.data.slideTemplate.frames;
                    return acc + (frames.total - frames.out);
                }, 0);
                formData.append('slideshowId', this.$route.params.id);
                formData.append('title', this.slideshow.title);
                formData.append('socket_id', this.$root.socket_id);
                formData.append('fps', this.fps);
                formData.append('slides', JSON.stringify(this.slides));
                formData.append('videoDuration', (totalFrames / this.fps));
                formData.append('preview', settings.isPreview);
                formData.append('audioTrack', settings.audioTrack);
                formData.append('audioTrackLevel', settings.audioTrackLevel);
                formData.append('narrationTrackLevel', settings.narrationTrackLevel);
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
