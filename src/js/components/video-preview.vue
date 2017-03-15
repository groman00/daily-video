<style scoped></style>
<template>
    <div class="video-preview">
        <loading-indicator v-if="loading"></loading-indicator>
        <video v-else ref="video" class="video" playsinline preload="none" :src="'/videos/' + src + '.mp4'" @ended="videoEnded"></video>
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
            this.eventHub.$on('show-preview', this.showPreview);
        },
        beforeDestroy() {
            this.eventHub.$off('show-preview', this.showPreview);
        },
        methods: {
            showPreview(slide) {
                // this.src = templateName;
                // this.$nextTick(() => {
                //     this.$refs.video.play();
                // });
                this.$http.post(api.route('generate-slide-preview'), {
                    'slide': slide,
                    'socket_id': this.$root.socket_id,
                    'timestamp': '_' + new Date().getTime()
                })
                .then((response) => {
                    console.log(response);
                });
            },
            videoEnded() {
                this.src = '';
            }
        }
    }
</script>
