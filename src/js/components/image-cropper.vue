<style scoped></style>
<template>
    <div class="image-cropper">
        <div class="thumbnail">
            <img class="thumbnail-image" :src="imageSrc" @click="triggerFileUpload">
        </div>
        <overlay :open="isCropping" class="image-cropper-overlay">
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
        </overlay>
        <input ref="fileInput" style="display: none;" type="file" accept="image/*" @change="fileChanged">
    </div>
</template>
<script>
    import Cropper from 'cropperjs';
    import api from '../routers/api';

    export default {
        props: ['slide'],
        data() {
            return {
                imageSrc: '',
                imageToCrop: '',
                imageToCropHeight: 0,
                imageToCropWidth: 0,
                isCropping: false,
                cropper: undefined
            }
        },
        created() {
            this.imageSrc = this.slide.image_url_thumb;
        },
        watch: {
            imageToCrop(src) {
                this.cropper.replace(src);
            }
        },
        mounted() {
            this.cropper = new Cropper(this.$refs.cropperImage, {
              aspectRatio: 1920 / 1080
            });
        },
        methods: {
            triggerFileUpload() {
                this.$refs.fileInput.click();
            },
            fileChanged(e) {
                const file = e.target.files[0];
                const reader = new FileReader();
                const image = new Image();
                let imageWidth;
                let clientWidth;
                reader.onload = (e) => {
                    image.src= e.target.result;
                }
                image.onload = (e) => {
                    clientWidth = document.documentElement.clientWidth;
                    imageWidth = image.naturalWidth;
                    this.imageToCropWidth = imageWidth < clientWidth ? imageWidth : clientWidth;
                    this.imageToCrop = image.src;
                    this.isCropping = true;
                }
                reader.readAsDataURL(file);
            },
            cropReset() {
                this.isCropping = false;
                this.imageToCrop = '';
                this.$refs.fileInput.value = '';
            },
            uploadImage(shouldCrop) {
                // todo: Still need to support GIF
                const file = this.$refs.fileInput.files[0];
                const formData = new FormData();
                const cropData = this.cropper.getData(true);
                formData.append('cropHeight', cropData.height);
                formData.append('cropWidth', cropData.width);
                formData.append('cropX', cropData.x);
                formData.append('cropY', cropData.y);
                formData.append('file', file, file.name);
                this.$http.post(api.route('slideshows-image-upload'), formData)
                    .then((response) => {
                        console.log(response)
                        this.imageSrc = response.body.images.image_url_thumb;
                        this.eventHub.$emit('slide-updated', Object.assign(this.slide, response.body.images, Object.assign(this.slide.data, { crop: response.body.crop })));
                        this.cropReset();
                    });
            }
        }
    }
</script>
