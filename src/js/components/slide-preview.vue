<style scoped></style>
<template>
    <div class="slide-preview">
        <loading-indicator v-if="loading"></loading-indicator>
        <div v-show="!loading" ref="preview" style="position: relative;">
            <!-- MAYBE TRY USING A CANVAS INSTEAD? -->
            <!-- http://www.williammalone.com/articles/create-html5-canvas-javascript-sprite-animation/ -->
            <!-- requestAnimationFrame! -->
            <!-- http://awardwinningfjords.com/2012/03/08/image-sequences.html -->
            <img class="frame" style="position: absolute;z-index: -1;" v-for="frame in frames" :src="'/exports/preview_' + previewId + '/' + frame" @load="imageLoaded">
        </div>
    </div>

</template>
<script>

    export default {
        data() {
            return {
                loading: false,
                fps: 30,
                previewId: undefined,
                frames: [],
                totalImages: 0,
                imagesLoaded: 0
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
            imageLoaded() {
                this.imagesLoaded = this.imagesLoaded + 1;
                if (this.imagesLoaded === this.totalImages) {
                    this.loading = false;
                    this.runPreview();
                }
            },
            runPreview() {
                let i = 0;
                let interval = setInterval(() => {
                    this.$refs.preview.children[i].style.zIndex = i;
                    i = i + 1;
                    if (i === this.totalImages) {
                        this.reset();
                        clearInterval(interval);
                        console.log('preview done');
                    }
                }, this.fps);
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
                this.frames = preview.files;
                this.totalImages = preview.files.length;
            },
            reset() {
                console.log('resetting');
                this.previewId= undefined;
                this.frames = [];
                this.totalImages = 0;
                this.imagesLoaded = 0;
            }
        }
    }
</script>
