<style scoped></style>
<template>
    <div class="video-editor-item">
        <div class="drag-handle"></div>
        <image-cropper v-if="hasFields('image')" :slide="slide"></image-cropper>
        <video-uploader v-if="hasFields('video')" :slide="slide"></video-uploader>
        <div v-if="hasFields('credit')" class="form-control">
            <input v-model="slide.credit" placeholder="Source Credit" :value="slide.credit" type="text" @change="itemUpdated">
        </div>
        <div class="form-control">
            <select v-model="slide.data.slideType" @change="slideTypeUpdated">
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
        <div v-if="isSlideOfType('image')" class="form-control">
            <select v-model="slide.data.image.effect" @change="itemUpdated">
                <option disabled :value="undefined">Select Effect</option>
                <option v-for="(effect, id) in effects" :value="id">
                    {{ effect }}
                </option>
            </select>
        </div>
        <div v-if="hasFields('bumper')" class="form-control">
            <select v-model="slide.data.bumper" @change="itemUpdated">
                <option v-for="bumper in bumpers" :value="bumper">
                    {{ 'Bumper ' + (bumper + 1) }}
                </option>
            </select>
        </div>
        <div v-if="hasFields('title')" class="form-control">
            <input v-model="slide.title" placeholder="Add a title" :value="slide.title" type="text" @change="itemUpdated">
        </div>
        <div v-if="hasFields('caption')" class="form-control">
            <textarea v-model="slide.caption" placeholder="Add a caption" @change="itemUpdated">
                {{ slide.caption }}
            </textarea>
        </div>
        <div v-if="isSlideOfType('image', 'video')" class="form-control">
            <select v-model="slide.data.textAlignment" @change="itemUpdated">
                <option disabled :value="undefined">Select Text Alignment</option>
                <option v-for="(alignment, id) in textAlignments" :value="id">
                    {{ alignment }}
                </option>
            </select>
        </div>
        <div v-if="hasCustomDuration()" class="form-control">
            <label class="label">Duration in seconds:</label>
            <input v-model="slide.data.duration" type="number" min="1" max="20" step=".1" @blur="durationUpdated">
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
            'textAlignments',
            'format',
            'bumpers'
        ],
        data() {
            return {
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
                console.log('slide changed');
                this.itemUpdated();
            },
            'slide.data.slideType'(type) {
                this.slide.data.slideTemplate = this.slideTypes[type];
            },
            'slide.data.slideTemplate'(template) {
                this.fields = template.fields;
            },
            'slide.data.duration'(duration) {
                if (duration < 1) {
                    this.slide.data.duration = 1;
                    return;
                }
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
                let template;
                if (!slideTypes.hasOwnProperty(slideData.slideType)) {
                    this.slide.data.slideType = 'image';
                }
                this.slide.data.slideTemplate = slideTypes[this.slide.data.slideType];
                this.setDuration();
            },
            /**
             * Return true if any of the provided fields exist in the templates field array
             * @param  {...[String]} fields
             * @return {Boolean}
             */
            hasFields(...fields) {
                return fields.some((field) => this.fields.indexOf(field) > -1);
            },
            /**
             * Return true if this slide type matches a provided slide type
             * @param  {...[String]} types
             * @return {Boolean}
             */
            isSlideOfType(...types) {
                return types.indexOf(this.slide.data.slideType) > -1;
            },
            hasCustomDuration() {
                return this.isSlideOfType('image', 'title');
            },
            setDuration() {
                if (!this.slide.data.duration) {
                    this.slide.data.duration = this.getDefaultDuration();
                }
            },
            durationUpdated() {
                this.$emit('durationUpdated');
                this.itemUpdated();
            },
            getDefaultDuration() {
                return Math.floor(framesToSeconds(this.slide.data.slideTemplate.frames));
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
            slideTypeUpdated() {
                this.$nextTick(() => {
                    this.slide.data.duration = this.getDefaultDuration();
                    this.durationUpdated();
                });
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
            }
        }
    }
</script>
