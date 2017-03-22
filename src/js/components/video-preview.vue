<style scoped></style>
<template>
    <div class="video-preview">
        <loading-indicator v-if="loading"></loading-indicator>
        <video v-else ref="video" class="video" playsinline preload="none" :src="'/exports/' + src" @ended="videoEnded"></video>
    </div>
</template>
<script>
    import api from '../routers/api';

    export default {
        data() {
            return {
                src: '',
                loading: false
            }
        },
        created() {
            this.eventHub.$on('fetching-preview', this.fetchingPreview);
            this.eventHub.$on('play-preview', this.playPreview);
            this.$root.socket.on('preview-ready', this.playPreview);
            this.$root.socket.on('preview-error', this.previewError);
        },
        beforeDestroy() {
            this.eventHub.$off('fetching-preview', this.fetchingPreview);
            this.eventHub.$off('play-preview', this.playPreview);
            this.$root.socket.off('preview-ready', this.playPreview);
            this.$root.socket.off('preview-error', this.previewError);
        },
        methods: {
            fetchingPreview() {
                this.loading = true;
            },
            previewError() {
                this.loading = false;
                // Show error message?
            },
            playPreview(src) {
                this.loading = false;
                this.src = src;
                this.$nextTick(() => {
                    this.$refs.video.play();
                });
            },
            videoEnded() {
                this.src = '';
            }
        }
    }
</script>
