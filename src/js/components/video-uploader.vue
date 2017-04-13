<style scoped></style>
<template>
    <div class="video-uploader">
        <video ref="video" :src="src" style="width:100%;"></video>
        <!-- <overlay :open="isCropping" class="image-cropper-overlay">
            <div slot="overlay-content">
                <div class="image-cropper-overlay-heading clearfix">
                    <div class="button-group pull-right">
                        <button class="button button-default" @click="cropReset">Cancel</button>
                        <button class="button button-blue" @click="uploadImage(false)">Add without cropping</button>
                        <button class="button button-blue" @click="uploadImage(true)">Crop and Add</button>
                    </div>
                </div>
                <div :style="{ width: imageToCropWidth + 'px' }" class="image-cropper-overlay-content">
                    <img ref="cropperImage" :src="imageToCrop">
                </div>
           </div>
        </overlay> -->
        <!-- <input ref="fileInput" type="file" accept="video/*" @change="fileChanged"> -->
        <input ref="fileInput" type="file" accept="video/mp4" @change="fileChanged">
    </div>
</template>
<script>
    import api from '../routers/api';

    export default {
        props: ['slide'],
        data() {
            return {
                src: ''
            }
        },
        created() {},
        watch: {},
        methods: {
            fileChanged(e) {
                const file = e.target.files[0];
                const formData = new FormData();
                formData.append('file', file, file.name);
                this.$http.post(api.route('slideshows-video-upload'), formData)
                    .then((response) => {
                        console.log(response)
                        this.src = response.body.source;
                        console.log(this.$refs.video.duration)
                        this.$nextTick(() => {
                            this.eventHub.$emit('slide-updated', Object.assign(
                                this.slide,
                                Object.assign(this.slide.data, {
                                    video: {
                                        source: response.body.source,
                                        inPoint: 0,
                                        outPoint: 3
                                        // outPoint: this.$refs.video.duration
                                    }
                                })
                            ));
                        });
                    });
            }
        }
    }
</script>
