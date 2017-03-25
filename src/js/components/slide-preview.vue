<style scoped></style>
<template>
    <div class="slide-preview">
        <loading-indicator v-if="loading"></loading-indicator>
        <div v-show="!loading" ref="preview" style="position: relative;">
            <canvas height="270" width="480" class="slide-preview-canvas" ref="previewCanvas"></canvas>
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
                fps: 30,
                previewId: undefined,
                files: [],
                frames: [],
                totalFrames: 0,
                imagesLoaded: 0,
                animationFrame: undefined,
                currentFrame: 0,
                context: undefined
            }
        },
        created() {
            this.eventHub.$on('fetching-preview', this.fetchingPreview);
            this.eventHub.$on('play-preview', this.playPreview);
            this.$root.socket.on('preview-error', this.previewError);
        },
        mounted() {
            this.context = this.$refs.previewCanvas.getContext("2d");
        },
        beforeDestroy() {
            this.eventHub.$off('fetching-preview', this.fetchingPreview);
            this.eventHub.$off('play-preview', this.playPreview);
            this.$root.socket.off('preview-error', this.previewError);
        },
        watch: {
            files(frames) {
                let img;
                frames.forEach((frame) => {
                    img = doc.createElement('img');
                    img.onload = this.imageLoaded;
                    img.src = this.imageSource(frame);
                    this.frames.push(img);
                });
            }
        },
        methods: {
            imageLoaded() {
                this.imagesLoaded = this.imagesLoaded + 1;
                if (this.imagesLoaded === this.totalFrames) {
                    this.loading = false;
                    //this.runPreview();
                    this.animationLoop();
                }
            },
            animationLoop() {
                if (this.currentFrame < this.totalFrames) {
                    this.context.drawImage(this.frames[this.currentFrame], 0, 0, 480, 270);
                    this.currentFrame = this.currentFrame + 1;
                    this.animationFrame = win.requestAnimationFrame(this.animationLoop);
                    return;
                }
                this.reset();
            },
            imageSource(file) {
                return '/exports/preview_' + this.previewId + '/' + file;
            },
            fetchingPreview() {
                this.loading = true;
            },
            previewError() {
                this.loading = false;
                // Show error message?
            },
            playPreview(preview) {
                console.log('files!', preview)
                this.previewId= preview.previewId;
                this.files = preview.files;
                this.totalFrames = preview.files.length;
            },
            reset() {
                this.previewId= undefined;
                this.files = [];
                this.frames = [];
                this.totalFrames = 0;
                this.imagesLoaded = 0;
                this.currentFrame = 0;
                this.context.clearRect(0, 0, 480, 270);
            }
        }
    }
</script>
