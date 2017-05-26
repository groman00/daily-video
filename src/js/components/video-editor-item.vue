<style scoped></style>
<template>
    <div class="video-editor-item">
        <div class="move-buttons clearfix">
            <button v-if="slideIndex !== 0" class="button button-small button-default pull-left" @click="moveSlide(-1)">&lt;</button>
            <button v-if="slideIndex < (slideCount - 1)" class="button button-small button-default pull-right" @click="moveSlide(1)">&gt;</button>
        </div>
        <image-cropper v-if="this.fields.includes('image')" :slide="slide"></image-cropper>
        <video-uploader v-if="this.fields.includes('video')" :slide="slide"></video-uploader>
        <div v-if="fields.includes('image')" class="form-control">
            <input v-model="slide.credit" placeholder="Image Credit" :value="slide.credit" type="text" @change="itemUpdated">
        </div>
        <div class="form-control">
            <select v-model="slide.data.slideType" @change="itemUpdated">
                <option v-for="(obj, type) in slideTypes" :value="type">
                    {{ type }}
                </option>
            </select>
        </div>
        <div class="form-control">
            <select v-model="slide.data.transition" @change="itemUpdated">
                <option v-for="(transition, id) in transitions" :value="id">
                    {{ transition }}
                </option>
            </select>
        </div>
        <div v-if="fields.includes('image')" class="form-control">
            <select v-model="slide.data.image.effect" @change="itemUpdated">
                <option disabled :value="undefined">Select Effect</option>
                <option v-for="(effect, id) in effects" :value="id">
                    {{ effect }}
                </option>
            </select>
        </div>
        <div v-if="fields.includes('title')" class="form-control">
            <input v-model="slide.title" placeholder="Add a title" :value="slide.title" type="text" @change="itemUpdated">
        </div>
        <div v-if="fields.includes('caption')" class="form-control">
            <textarea v-model="slide.caption" placeholder="Add a caption" @change="itemUpdated">
                {{ slide.caption }}
            </textarea>
        </div>
        <div v-if="['image', 'title'].indexOf(slide.data.slideType) > -1" class="form-control">
            <label class="label">Duration in seconds:</label>
            <input v-model="duration" type="number" min="1" max="20" step=".1" @blur="durationUpdated">
        </div>
        <div class="form-control">
            <div class="button-bar">
                <button class="button button-blue" :disabled="isDisabled" @click="fetchPreview(slide)">Preview</button>
                <button class="button button-danger" :disabled="isDisabled" @click="deleteSlide">Delete</button>
            </div>
        </div>
        <div class="form-control"></div>
        <div class="form-control text-center">
            <label>{{ isSaving ? 'Saving...' : '&nbsp;' }}</label>
        </div>
    </div>
</template>
<script>
    import api from '../routers/api';
    import { framesToSeconds } from '../lib/helpers';

    export default {
        props: [
            'slide',
            'slideshowId',
            'slideTypes',
            'slideIndex',
            'slideCount',
            'theme',
            'effects',
            'transitions',
            'format'
        ],
        data() {
            return {
                // templates: {},
                fields: [],
                hasPreview: false,
                isDisabled: false,
                isSaving: false,
                duration: 0,
                preview: {
                    previewId: 0,
                    files: []
                }
            }
        },
        created() {
            // this.loadSlideTemplates();
            this.initSlide();
            this.eventHub.$on('fetching-preview', this.setDisabled);
            this.$root.socket.on('preview-ready', this.previewReady);
            this.$root.socket.on('preview-error', this.setEnabled);
        },
        beforeDestroy() {
            this.eventHub.$off('fetching-preview', this.setDisabled);
            this.$root.socket.off('preview-ready', this.previewReady);
            this.$root.socket.off('preview-error', this.setEnabled);
        },
        watch: {
            slide() {
                // this.itemUpdated();
            },
            'slide.data.slideType'(type) {
                // this.templates = Object.assign({}, this.slideTypes[type].templates);
                // this.setDefaultSlideTemplate(this.templates);
                // this.itemUpdated();
                this.slide.data.slideTemplate = this.slideTypes[type];
            },
            'slide.data.slideTemplate'(template) {
                this.fields = template.fields;
                this.setDuration();
            },
            format() {
                this.itemUpdated(false);
            },
            theme() {
                this.itemUpdated(false);
            }
        },
        methods: {
            initSlide() {
                const slideTypes = this.slideTypes;
                const slideData = this.slide.data;
                const slideType = slideData.slideType;
                // const slideTemplate = slideData.slideTemplate;
                let template;

                if (!slideTypes.hasOwnProperty(slideData.slideType)) {
                    this.slide.data.slideType = 'image';
                }

                // template = slideTypes[this.slide.data.slideType];
                this.slide.data.slideTemplate = slideTypes[this.slide.data.slideType];


                // this.fields = template.fields;


                this.setDuration();

            },
            loadSlideTemplates() {
                /*
                const slideData = this.slide.data;
                const slideType = slideData.slideType;
                const slideTemplate = slideData.slideTemplate;
                const templates = this.slideTypes[slideType].templates
                this.templates = Object.assign({}, templates);
                if (!slideTemplate) {
                    this.setDefaultSlideTemplate(templates);
                }
                this.fields = this.slide.data.slideTemplate.fields;
                this.setDuration();
                */
            },
            setDuration() {
                this.duration = this.slide.data.duration || Math.floor(framesToSeconds(this.slide.data.slideTemplate.frames));
            },
            setDefaultSlideTemplate(templates) {
                // default to first template in this type
                this.slide.data.slideTemplate = templates[Object.keys(templates)[0]];
            },
            fetchPreview(slide) {
                if (this.hasPreview) {
                    this.dispatchPreview();
                    return false;
                }
                this.eventHub.$emit('fetching-preview');
                this.$http.post(api.route('preview-slide'), {
                    'theme': this.theme,
                    'slide': slide,
                    'format': this.format,
                    'socket_id': this.$root.socket_id
                })
                .then((response) => {
                    this.preview = Object.assign({}, { previewId: response.body.previewId });
                    this.hasPreview = true;
                });
            },
            previewReady(preview) {
                if (preview.previewId === this.preview.previewId && preview.files) {
                    this.preview = Object.assign({}, preview);
                    this.dispatchPreview();
                }
                this.isDisabled = false;
            },
            dispatchPreview() {
                this.eventHub.$emit('play-preview', this.preview);
            },
            setDisabled() {
                this.isDisabled = true;
            },
            itemUpdated(save = true) {
                this.hasPreview = false;
                if (save) {
                    this.saveSlide();
                }
            },
            durationUpdated() {
                this.eventHub.$emit('slide-updated', Object.assign(
                    this.slide,
                    Object.assign(this.slide.data, {
                        duration: this.duration
                    })
                ));
            },
            saveSlide() {
                console.log('saving slide: ' + this.slide.id);
                /*this.isSaving = true;
                this.$http.post(api.route('slideshows-save-slide'), this.slide)
                    .then((response) => {
                        console.log(response);
                        this.isSaving = false;
                    });*/
            },
            deleteSlide() {
                this.isDisabled = true;
                this.$http.post(api.route('slideshows-delete-slide'), this.slide)
                    .then((response) => {
                        this.eventHub.$emit('slide-removed', this.slide);
                        this.isDisabled = false;
                    });
            },
            moveSlide(direction) {
                const to = this.slideIndex + direction;
                const from = this.slideIndex;
                this.eventHub.$emit('slide-moved', from, to);
                this.$http.post(api.route('slideshows-move-slide'), {
                    slideshowId: this.slideshowId,
                    slideId: this.slide.id,
                    index: (to + 1) // index is 1 based, not 0
                });
            }
        }
    }
</script>
