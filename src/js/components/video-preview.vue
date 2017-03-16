<style scoped></style>
<template>
    <div class="video-preview">
        <loading-indicator v-if="loading"></loading-indicator>
        <!-- <video v-else ref="video" class="video" playsinline preload="none" :src="'/videos/' + src + '.mp4'" @ended="videoEnded"></video> -->
        <video v-else ref="video" class="video" playsinline preload="none" :src="'/exports/' + src" @ended="videoEnded"></video>
    </div>
</template>
<script>
    import api from '../routers/api';

    export default {
        data() {
            return {
                src: '',
                loading: true
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
            fetchPreview(slide) {
                // this.src = templateName;
                // this.$nextTick(() => {
                //     this.$refs.video.play();
                // });


                // Need a way to check if this file has already been generated,
                // so we don't have to do it again.
                this.loading = true;
                this.$http.post(api.route('generate-slide-preview'), {
                    'slide': slide,
                    'socket_id': this.$root.socket_id,
                    'timestamp': '_' + new Date().getTime()
                })
                .then((response) => {
                    console.log(response);
                });
            },
            showPreview(src) {
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
