<style scoped></style>
<template>
    <div class="video-editor-item">
        <div class="move-buttons clearfix">
            <button v-if="slideIndex !== 0" class="button button-small button-default pull-left" @click="moveSlide(-1)">&lt;</button>
            <button v-if="slideIndex < (slideCount - 1)" class="button button-small button-default pull-right" @click="moveSlide(1)">&gt;</button>
        </div>
        <image-cropper v-if="this.fields.includes('image')" :slide="slide"></image-cropper>
        <video-uploader v-if="this.fields.includes('video')" :slide="slide"></video-uploader>
        <div class="form-control">
            <select v-model="slide.data.slideType">
                <option v-for="(obj, type) in slideTypes" :value="type">
                    {{ type }}
                </option>
            </select>
        </div>
        <div class="form-control">
            <select v-model="slide.data.slideTemplate" @change="itemUpdated">
                <option v-for="template in templates" :value="template">
                    {{ template.title }}
                </option>
            </select>
        </div>
        <div v-if="this.fields.includes('title')" class="form-control">
            <input v-model="slide.title" placeholder="Add a title" :value="slide.title" type="text" @change="itemUpdated">
        </div>
        <div v-if="this.fields.includes('caption')" class="form-control">
            <textarea v-model="slide.caption" placeholder="Add a caption" @change="itemUpdated">
                {{ slide.caption }}
            </textarea>
        </div>
        <div class="form-control">
            <div class="button-bar">
                <button class="button button-blue" :disabled="isDisabled" @click="fetchPreview(slide)">Preview</button>
                <button class="button button-danger" :disabled="isDisabled" @click="deleteSlide">Delete</button>
            </div>
        </div>
        <div class="form-control">

        </div>
        <div class="form-control text-center">
            <label>{{ isSaving ? 'Saving...' : '&nbsp;' }}</label>
        </div>
    </div>
</template>
<script>
    import api from '../routers/api';

    export default {
        props: ['slide', 'slideshowId', 'slideTypes', 'slideIndex', 'slideCount', 'theme'],
        data() {
            return {
                templates: {},
                fields: [],
                hasPreview: false,
                isDisabled: false,
                isSaving: false,
                preview: {
                    previewId: 0,
                    files: []
                }
            }
        },
        created() {
            this.loadSlideTemplates();
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
            slideIndex(index, oldIndex) {
                console.log('slideIndex Updated', index, oldIndex);
            },
            'slide.data.slideType'(type) {
                console.log('slidetype updated', arguments);
                this.templates = Object.assign({}, this.slideTypes[type].templates);
                this.setDefaultSlideTemplate(this.templates);
                this.itemUpdated();
            },
            'slide.data.slideTemplate'(template) {
                this.fields = template.fields;
            }
        },
        methods: {
            loadSlideTemplates() {
                const slideType = this.slide.data.slideType;
                const slideTemplate = this.slide.data.slideTemplate;
                const templates = this.slideTypes[slideType].templates
                this.templates = Object.assign({}, templates);
                if (!slideTemplate) {
                    this.setDefaultSlideTemplate(templates);
                }
                this.fields = this.slide.data.slideTemplate.fields;
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
            itemUpdated() {
                this.hasPreview = false;
                this.saveSlide();
            },
            saveSlide() {
                console.log('saving slide: ' + this.slide.id);
                this.isSaving = true;
                this.$http.post(api.route('slideshows-save-slide'), this.slide)
                    .then((response) => {
                        console.log(response);
                        this.isSaving = false;
                    });
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
