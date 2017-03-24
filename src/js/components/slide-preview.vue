<style scoped></style>
<template>
    <div ref="container" style="position: relative;">
        <img style="position: absolute;z-index: -1;" v-for="n in numImages" :src="imageSrc(n)" @load="imageLoaded">
    </div>
</template>
<script>
    export default {
        data() {
            return {
                fps: 30,
                images: [],
                numImages: 119,
                imagesLoaded: 0,
            }
        },
        created() {},
        beforeDestroy() {},
        methods: {
            imageSrc(n) {
                n = String(n);
                var number = "00000".substr(0, (5-n.length)) + n;
                return '/testing/slide_in_out_' + number + '.jpg';
            },
            imageLoaded() {
                this.imagesLoaded = this.imagesLoaded + 1;
                if (this.imagesLoaded = this.numImages) {
                    this.runPreview();
                }
            },
            runPreview() {
                let i = 0;
                let interval = setInterval(() => {
                    this.$refs.container.children[i].style.zIndex = i;
                    i = i + 1;
                    if (i === this.numImages) {
                        clearInterval(interval);
                        console.log('preview done');
                    }
                }, this.fps);
            }
        }
    }
</script>
