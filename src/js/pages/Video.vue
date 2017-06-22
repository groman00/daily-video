<style scoped></style>
<template>
    <div class="video-page page-wrapper">
        <app-bar :config="{ buttonLeft: 'back', dynamicTitle: true, title: slideshow.title }" @titleUpdated="titleUpdated"></app-bar>
        <div v-if="slideshow" class="flex-columns flex-grow-1">
            <div class="panels-top flex-rows flex-grow-1">
                <div class="panel-left">
                    <video-editor :slideshowId="slideshow.id" :slides="slides" :config="config" :theme="theme" :format="format" @durationUpdated="durationUpdated" @slideMoved="moveSlide"></video-editor>
                </div>
                <div class="panel-right">
                    <slide-preview></slide-preview>
                </div>
            </div>
            <div class="panels-bottom flex-shrink-1">
                <video-toolbar ref="videoToolbar" :onSubmit="renderProject" :onSave="saveProject" :slideshow="slideshow" :themes="config.themes" :audioTracks="config.audioTracks" :videoDuration="videoDuration" @formatUpdated="formatUpdated" @themeUpdated="themeUpdated"></video-toolbar>
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
                config: {},
                format: 'square',
                theme: '',
                slides: [],
                slideshow: {},
                videoDuration: 0
            }
        },
        created() {
            this.fetchData();
            this.eventHub.$on('slide-added', this.addSlide);
            this.eventHub.$on('slide-removed', this.removeSlide);
            this.eventHub.$on('slide-updated', this.updateSlide);
        },
        beforeDestroy() {
            this.eventHub.$off('slide-added', this.addSlide);
            this.eventHub.$off('slide-removed', this.removeSlide);
            this.eventHub.$off('slide-updated', this.updateSlide);
        },
        methods: {
            titleUpdated(title) {
                this.slideshow.title = title;
                this.saveSlideshow();
            },
            themeUpdated(theme) {
                // Should we set a cookie or localStorage for this?
                this.theme = theme;
            },
            formatUpdated(format) {
                this.format = format;
            },
            durationUpdated(duration) {
                this.videoDuration = duration;
            },
            fetchData() {
                let body;
                let slides;
                this.$http.get(api.route('slideshow', { id: this.$route.params.id }))
                    .then((response) => {
                        body = response.body;
                        this.config = body.config;
                        // this.slideshow = this.parseSlideshow(body.slideshow);
                        this.slideshow = body.slideshow;
                        this.slides = this.slideshow.slides;
                    }, (response) => {
                        // console.log('error', response);
                    });
            },
            parseSlideshow(slideshow) {
                // Merge template config into slide data
                // slideshow.slides.forEach((slide) => {
                //     if (slide.data.slideTemplate) {
                //         slide.data.slideTemplate = this.config.slideTypes[slide.data.slideType];
                //     }
                // });
                return slideshow;
            },
            addSlide(slideshow, slide) {
                // *WORKAROUND*
                // Amp api sometimes adds slides in the wrong position
                // Do some logic here to make sure the newly added slide is in the correct
                // position on the front end.
                this.slides.splice(slideshow.slides.findIndex((s) => {
                    return s.id === slide.id;
                }), 0, slide);
            },
            moveSlide(from, to) {
                this.slides.splice(to, 0, this.slides.splice(from, 1)[0] );
            },
            removeSlide(removedSlide) {
                this.slides = this.slides.filter((slide) => {
                    return slide.id != removedSlide.id;
                });
            },
            updateSlide(updatedSlide) {
                const index = this.slides.findIndex((slide) => {
                    return slide.id === updatedSlide.id;
                });
                this.$set(this.slides, index, Object.assign({}, this.slides[index], updatedSlide));
            },
            saveSlideshow() {
                this.$http.post(api.route('slideshows-save'), this.slideshow)
                    .then((response) => {
                        console.log(response);
                    }, (response) => {
                        console.log('error', response);
                    });
            },
            getFormData(settings) {
                const formData = new FormData();
                const narrationTrack = settings.narrationTrack;
                const audioTrack = settings.audioTrack;

                formData.append('slideshowId', this.$route.params.id);
                formData.append('title', this.slideshow.title);
                formData.append('socket_id', this.$root.socket_id);
                formData.append('fps', this.config.fps);
                formData.append('slides', JSON.stringify(this.slides));
                formData.append('videoDuration', this.videoDuration);
                formData.append('preview', settings.isPreview);
                formData.append('audioTrack', settings.audioTrack);
                formData.append('audioTrackLevel', settings.audioTrackLevel);
                formData.append('narrationTrackLevel', settings.narrationTrackLevel);
                formData.append('theme', this.theme);
                formData.append('format', this.format);
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
