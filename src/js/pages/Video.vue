<style scoped></style>
<template>
    <div class="video-page page-wrapper">
        <app-bar :config="{ buttonLeft: 'back', title: title }" :onBackButton="goBack"></app-bar>
        <div class="panels flex-grow-1">
            <div class="panels-top flex-grow-1">
                <div class="panel-left">
                    <video-editor :slides="slides" :templates="templates"></video-editor>
                </div>
                <div class="panel-right">
                    <video-preview></video-preview>
                </div>
            </div>
            <div class="panels-bottom flex-grow-0">
                <video-toolbar ref="videoToolbar" :onSubmit="generateVideo"></video-toolbar>
            </div>
        </div>
    </div>
</template>
<script>
    import api from '../routers/api';

    export default {
        data() {
            return {
                slides: [],
                fps: 0,
                templates: {},
                title: ''
            }
        },
        created() {
            this.fetchData();
        },
        methods: {
            fetchData() {
                let body;
                this.$http.get(api.route('slideshow', { id: this.$route.params.id }))
                    .then((response) => {
                        body = response.body;
                        this.fps = body.config.fps;
                        this.templates = this.parseTemplates(body.config.templates);
                        this.slides = this.parseSlides(body.slideshow.slides);
                        this.title = body.slideshow.title;
                        console.log(this.slides);
                    }, (response) => {
                        // console.log('error', response);
                    });
            },
            /**
             * Convert templates array to object with keys
             * @param  {Array} templates
             * @return {Object}
             */
            parseTemplates(templates) {
                return templates.reduce(function (acc, template) {
                    acc[template.name] = template;
                    return acc;
                }, {});
            },
            /**
             * Pre-assign templates to slides based on slide type.
             * @param  {Array} slides
             * @return {Array}
             */
            parseSlides(slides) {
                let type;
                return slides.map((slide) => {
                    switch (slide.type) {
                        case 'quote':
                            type = 'quote';
                            break;
                        case 'text':
                            type = 'title_1';
                            break;
                        default:
                            type = 'slide_in_out';
                    }
                    slide.template = this.templates[type];
                    slide.image = slide.image_url_large;
                    slide.bumper = false;
                    return slide;
                });
            },
            goBack() {
                this.$router.push({ name: 'home' });
            },
            /**
             * Merge bumpers, dates, etc into slide data for upload
             * @return {Array}
             */
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
            generateVideo(settings) {
                let frames;
                const formData = new FormData();
                const slideData = this.mergeDefaultSlides();
                const narrationTrack = settings.narrationTrack;
                const audioTrack = settings.audioTrack;
                const totalFrames = slideData.reduce(function (acc, slide) {
                    frames = slide.template.frames;
                    return acc + (frames.total - frames.out);
                }, 0);

                formData.append('socket_id', this.$root.socket_id);
                formData.append('fps', this.fps);
                formData.append('slides', JSON.stringify(slideData));
                formData.append('videoDuration', (totalFrames / this.fps));
                formData.append('timestamp', '_' + new Date().getTime());
                formData.append('preview', settings.isPreview);
                formData.append('audioTrack', settings.audioTrack);
                formData.append('audioTrackLevel', settings.audioTrackLevel);
                formData.append('narrationTrackLevel', settings.narrationTrackLevel);

                if (narrationTrack){
                    formData.append('narrationTrack', narrationTrack, narrationTrack.name);
                }

                console.log(formData);
                this.$http.post(api.route('generate-video'), formData)
                    .then((response) => {
                        console.log(response);
                    }, (response) => {
                        console.log('error', response);
                    });
                return false;
            }
        }
    }
</script>
