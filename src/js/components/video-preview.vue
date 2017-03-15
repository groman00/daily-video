<style scoped></style>
<template>
    <div class="video-preview">
        <video ref="video" class="video" playsinline preload="none" :src="'/videos/' + src + '.mp4'"></video>
    </div>
</template>
<script>
    export default {
        data() {
            return {
                src: ''
            }
        },
        created() {
            this.eventHub.$on('show-preview', this.showPreview);
        },
        beforeDestroy() {
            this.eventHub.$off('show-preview', this.showPreview);
        },
        methods: {
            showPreview(templateName) {
                this.src = templateName;
                this.$nextTick(() => {
                    this.$refs.video.play();
                })
            }
        }
    }
</script>
