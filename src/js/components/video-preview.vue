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
            this.eventHub.$on('fetch-preview', this.fetchPreview);
            this.$root.socket.on('preview-ready', this.showPreview);
        },
        beforeDestroy() {
            this.eventHub.$off('fetch-preview', this.fetchPreview);
            this.$root.socket.off('preview-ready', this.showPreview);
        },
        methods: {
            fetchPreview(slide, hasPreview, timestamp) {
                // if (hasPreview) {
                //     this.showPreview('preview_' + slide.id + timestamp + '.mp4');
                //     return;
                // }
                this.loading = true;
                this.eventHub.$emit('video-rendering');
                this.$http.post(api.route('preview-slide'), {
                    'slide': slide,
                    'socket_id': this.$root.socket_id
                    // ,
                    // 'timestamp': timestamp
                })
                .then((response) => {
                    console.log(response);
                });
            },
            showPreview(src) {
                this.eventHub.$emit('render-complete');
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
