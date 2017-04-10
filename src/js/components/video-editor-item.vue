<style scoped></style>
<template>
    <div class="video-editor-item">
        <image-cropper v-if="slide.data.slideType === 'image'" :slide="slide"></image-cropper>
        <thumbnail v-else :image="slide.image_url_thumb"></thumbnail>
        <div class="form-control">
            <select v-model="slide.data.slideType" @change="itemUpdated">
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
        <div class="form-control">
            <input v-model="slide.title" placeholder="Add a title" :value="slide.title" type="text" @change="itemUpdated">
        </div>
        <div class="form-control">
            <textarea v-model="slide.caption" placeholder="Add a caption" @change="itemUpdated">
                {{ slide.caption }}
            </textarea>
        </div>
        <div class="form-control">
            <button class="button button-blue" :disabled="isDisabled" @click="fetchPreview(slide)">Preview</button>
        </div>
        <div class="form-control">
            <button class="button button-blue" :disabled="isDisabled" @click="saveSlide">Save Slide</button>
        </div>
        <div class="form-control">
            <button class="button button-danger" :disabled="isDisabled" @click="deleteSlide">Delete Slide</button>
        </div>
    </div>
</template>
<script>
    import api from '../routers/api';

    export default {
        props: ['slide', 'slideTypes'],
        data() {
            return {
                templates: {},
                hasPreview: false,
                isDisabled: false,
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
            slide() {
                console.log('watch event', arguments);
            },
            'slide.data.slideType'(type) {
                this.templates = Object.assign({}, this.slideTypes[type].templates);
                this.setDefaultSlideTemplate(this.templates);
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
                    'slide': slide,
                    'socket_id': this.$root.socket_id
                })
                .then((response) => {
                    this.preview = Object.assign({}, { previewId: response.body.previewId });
                    this.hasPreview = true;
                });
            },
            previewReady(preview) {
                if (preview.previewId === this.preview.previewId) {
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
            },
            saveSlide() {
                this.isDisabled = true;
                this.$http.post(api.route('slideshows-save-slide'), this.slide)
                    .then((response) => {
                        console.log(response);
                        this.isDisabled = false;
                    });
            },
            deleteSlide() {
                this.isDisabled = true;
                this.$http.post(api.route('slideshows-delete-slide'), this.slide)
                    .then((response) => {
                        this.eventHub.$emit('slide-removed', this.slide);
                        this.isDisabled = false;
                    });
            }
        }
    }
</script>
