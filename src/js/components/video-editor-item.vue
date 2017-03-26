<style scoped></style>
<template>
    <div class="video-editor-item">
        <thumbnail :image="slide.image_url_thumb"></thumbnail>
        <div class="form-control">
            <select v-model="slide.template" @change="itemUpdated">
                <option v-for="template in templates" v-if="template.visible" :value="template">
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
            <label class="checkbox">
                <input type="checkbox" v-model="slide.bumper" @change="itemUpdated"> Add Bumper
            </label>
        </div>
        <div class="form-control">
            <button class="button button-blue" :disabled="isDisabled" @click="fetchPreview(slide)">Preview</button>
        </div>
    </div>
</template>
<script>
    import api from '../routers/api';

    export default {
        props: ['slide', 'templates'],
        data() {
            return {
                hasPreview: false,
                isDisabled: false,
                preview: {
                    previewId: 0,
                    files: []
                }
            }
        },
        created() {
            this.eventHub.$on('fetching-preview', this.setDisabled);
            this.$root.socket.on('preview-ready', this.previewReady);
            this.$root.socket.on('preview-error', this.setEnabled);
        },
        beforeDestroy() {
            this.eventHub.$off('fetching-preview', this.setDisabled);
            this.$root.socket.off('preview-ready', this.previewReady);
            this.$root.socket.off('preview-error', this.setEnabled);
        },
        methods: {
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
            }
        }
    }
</script>
