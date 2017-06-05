<style scoped></style>
<template>
    <div class="slide-preview">
        <loading-indicator v-if="loading"></loading-indicator>
        <div v-show="!loading && src" class="slide-preview-container">
            <video class="video" ref="preview" controls playsinline preload="none" :src="src"></video>
        </div>
    </div>
</template>
<script>
    var doc = document;
    var win = window;

    export default {
        data() {
            return {
                loading: false,
                src: null
            }
        },
        created() {
            this.eventHub.$on('fetching-preview', this.fetchingPreview);
            this.eventHub.$on('play-preview', this.playPreview);
            this.$root.socket.on('preview-error', this.previewError);
        },
        beforeDestroy() {
            this.eventHub.$off('fetching-preview', this.fetchingPreview);
            this.eventHub.$off('play-preview', this.playPreview);
            this.$root.socket.off('preview-error', this.previewError);
        },
        methods: {
            fetchingPreview() {
                this.loading = true;
            },
            previewError() {
                this.loading = false;
            },
            playPreview(preview) {
                const preview = this.$refs.preview;
                this.src = preview.file;
                this.loading = false;
                this.$nextTick(() => {
                    preview.currentTime = 0;
                    preview.play();
                });
            }
        }
    }
</script>
