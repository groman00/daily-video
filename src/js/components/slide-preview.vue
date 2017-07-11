<style scoped></style>
<template>
    <div class="slide-preview" :class="'slide-preview-' + format">
        <loading-indicator v-if="loading"></loading-indicator>
        <div v-show="!loading" class="slide-preview-container" ref="container">
            <div v-if="isStatic" class="slide-preview-static" :style="staticStyle">
                <pre class="caption" :class="['text-' + theme, 'text-alignment-' + textAlignment]">{{ activeSlide.caption }}</pre>
            </div>
            <video v-show="!isStatic" class="video" ref="video" controls playsinline muted preload="none" :src="src"></video>
        </div>
    </div>
</template>
<script>
    export default {
        props: ['format', 'theme'],
        data() {
            return {
                loading: false,
                src: null,
                isStatic: false,
                textAlignment: 7,
                slideType: 'image',
                activeSlide: {}
            }
        },
        created() {
            this.eventHub.$on('fetching-preview', this.fetchingPreview);
            this.eventHub.$on('play-preview', this.playPreview);
            this.eventHub.$on('active-slide-updated', this.updateStaticPreview);
            this.eventHub.$on('preview-error', this.previewError);
            // this.$root.socket.on('preview-error', this.previewError);
            // this.$root.socket.on('jobError', this.setEnabled);
        },
        beforeDestroy() {
            this.eventHub.$off('fetching-preview', this.fetchingPreview);
            this.eventHub.$off('play-preview', this.playPreview);
            this.eventHub.$off('active-slide-updated', this.updateStaticPreview);
            this.eventHub.$off('preview-error', this.previewError);
            try {
                // this.$root.socket.off('preview-error', this.previewError);
            } catch (e) {}
        },
        computed: {
            staticStyle() {
                const slide = this.activeSlide;
                if (slide.id) {
                    return {
                        backgroundImage: (this.slideType === 'image') ? 'url(' + slide.image_url_thumb + ')' : 'linear-gradient(45deg, #999, #000)',
                        transform: 'scale(' + this.getStaticPreviewScale() + ')'
                    };
                }
                return '';
            }
        },
        methods: {
            fetchingPreview() {
                this.loading = true;
            },
            previewError() {
                this.loading = false;
                alert('Error generating preview. Please try again.');
            },
            playPreview(preview) {
                const video = this.$refs.video;
                this.isStatic = false;
                this.src = preview.file;
                this.loading = false;
                video.autoplay = false;
                this.$nextTick(() => {
                    video.currentTime = 0;
                    video.autoplay = true; // Fixes safari not autoplaying
                    this.$refs.video.play();
                });
            },
            updateStaticPreview(slide) {
                if (['image', 'video'].indexOf(slide.data.slideType) > -1 && !this.loading) {
                    this.isStatic = true;
                    this.activeSlide = slide;
                    this.textAlignment = slide.data.textAlignment;
                    this.slideType = slide.data.slideType;
                } else {
                    this.isStatic = false;
                }
            },
            getStaticPreviewScale() {
                const container = this.$refs.container;
                const height = container.offsetHeight;
                const width = container.offsetWidth;
                if (this.format === 'square') {
                    return (width > height ? height : width) / 1080;
                }
                return width / 1920;
            }
        }
    }
</script>