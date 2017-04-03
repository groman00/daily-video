<style scoped></style>
<template>
    <div class="video-page page-wrapper">
        <app-bar :config="{ buttonLeft: 'back', title: title }" v-on:titleUpdated="titleUpdated" :onBackButton="goBack"></app-bar>
        <div class="flex-columns flex-grow-1">
            <div class="panels-top flex-rows flex-grow-1">
                <div class="panel-left">
                    <button class="button button-blue" @click="addSlide">+ New Slide</button>
                    <video-editor :slides="slides" :templates="templates"></video-editor>
                </div>
                <div class="panel-right">
                    <!-- <slide-preview></slide-preview> -->
                </div>
            </div>
            <div class="panels-bottom flex-shrink-1">
                <!-- <video-toolbar ref="videoToolbar" :onSubmit="renderProject" :onSave="saveProject" :slideshow="slideshow"></video-toolbar> -->
            </div>
        </div>
    </div>
</template>
<script>
    import api from '../routers/api';

    const defaultSlide = {
        bumper: false,
        title: '',
        caption: '',
        image_url_thumb: ''
    };

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
            this.fetchProjectConfig();
        },
        methods: {
            titleUpdated(title) {
                this.title = title;
            },
            fetchProjectConfig() {
                let body;
                let slides;
                this.$http.get(api.route('project-config'))
                    .then((response) => {
                        this.templates = this.parseTemplates(response.body.templates);
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

            addSlide() {
                this.slides.push(Object.assign(defaultSlide, {
                    template: this.templates['slide_in_out']
                }));
            }
        }
    }
</script>
