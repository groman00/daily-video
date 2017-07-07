<style scoped></style>
<template>
    <div class="progress-bar">
        <div class="progress-bar-track">
            <div class="progress-bar-fill" :style="{ 'width': (progress * 100) + '%'}"></div>
        </div>
        <template v-if="downloadLink">
            <a class="button button-blue download-link pull-right" style="margin-left: 12px;" @click="uploadVideo">Upload Video</a>
            <a class="button button-blue download-link pull-right" :href="downloadLink" target="_blank">Save Video</a>
        </template>
        <h3 class="progress-bar-label">{{ label }}</h3>
        <overlay :open="uploadOverlayVisible">
            <div slot="overlay-content" class="upload-dialog">
                <template v-if="isUploading">
                    <h2>Uploading to Vidible</h2>
                    <loading-indicator></loading-indicator>
                </template>
                <template v-else>
                    <h2>Upload Complete</h2>
                    <p>Links will be availble in the uploads panel shortly.</p>
                    <button class="button button-blue" @click="clearUploadOverlay">Close</button>
                </template>
            </div>
        </overlay>
    </div>
</template>
<script>
    import api from '../routers/api';

    /**
     * Todo: remove all logic not related to progress events.
     */
    export default {
        props: ['title'],
        data() {
            return {
                label: ' ',
                progress: 0,
                downloadLink: '',
                isUploading: false,
                uploadOverlayVisible: false
            }
        },
        created() {
            this.$root.socket.on('progress', this.showProgress);
            this.$root.socket.on('complete', this.showComplete);
            this.$root.socket.on('preview-error', this.showError);
            this.$root.socket.on('project-error', this.showError);
        },
        beforeDestroy() {
            try {
                this.$root.socket.off('progress', this.showProgress);
                this.$root.socket.off('complete', this.showComplete);
                this.$root.socket.off('preview-error', this.showError);
                this.$root.socket.off('project-error', this.showError);
            } catch (e) {}
        },
        methods: {
            showProgress(data) {
                this.label = data.message;
                this.progress = isNaN(data.progress) ? 1 : data.progress;
            },
            showComplete(data) {
                this.label = 'Render Complete';
                this.progress = 0;
                this.downloadLink = data.file;
                this.eventHub.$emit('render-complete');
            },
            showError(error) {
                this.label = error;
                this.progress = 0;
                this.eventHub.$emit('render-complete');
            },
            uploadVideo() {
                this.isUploading = true;
                this.$nextTick(() => {
                    this.uploadOverlayVisible = true;
                });
                const data = {
                    name: this.title + ' ' + Date.now(),
                    file: this.downloadLink
                };
                this.$http.post(api.route('vidible-upload'), data)
                    .then((response) => {
                        console.log(response);
                        this.isUploading = false
                    }, (response) => {
                        alert('upload failed.  Please try again.');
                        this.uploadOverlayVisible = false;
                        this.isUploading = false
                    });
            },
            clearUploadOverlay() {
                this.uploadOverlayVisible = false;
            }
        }
    }
</script>
