<style scoped></style>
<template>
    <div class="slide-preview">
        <loading-indicator v-if="loading"></loading-indicator>
        <div v-else ref="preview" style="position: relative;">
            <!-- MAYBE TRY USING A CANVAS INSTEAD? -->
            <img class="frame" style="position: absolute;z-index: -1;" v-for="file in preview.files" :src="'/exports/preview_' + preview.previewId + '/' + file" @load="imageLoaded">
        </div>
    </div>

</template>
<script>
    export default {
        data() {
            return {
                loading: false,
                fps: 30,
                //moves this to video editor for repeat views
                preview: {
                    files: [],
                    previewId: 0
                },
                totalImages: 0,
                imagesLoaded: 0
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
            imageLoaded() {
                this.imagesLoaded = this.imagesLoaded + 1;
                if (this.imagesLoaded = this.totalImages) {
                    this.runPreview();
                }
            },
            runPreview() {
                let i = 0;
                let interval = setInterval(() => {
                    this.$refs.preview.children[i].style.zIndex = i;
                    i = i + 1;
                    if (i === this.totalImages) {
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
                this.loading = false;
                this.imagesLoaded = 0;
                this.totalImages = preview.files.length;
                this.preview = Object.assign({}, preview);
                this.$nextTick(()=>{
                    console.log('image');
                    console.log(this.$refs.image);
                })
                // this.previewId = preview.previe
                // this.images = preview.files;
            },
        }
    }
</script>
