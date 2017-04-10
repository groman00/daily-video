<style scoped></style>
<template>
    <div class="image-cropper">
        <div class="thumbnail">
            <img class="thumbnail-image" :src="imageSrc">
        </div>
        <vue-core-image-upload
            ref="cropper"
            crop-ratio="1920:1080"
            text=""
            :class="['upload-button']"
            :crop="true"
            extensions="png,gif,jpeg,jpg"
            input-accept="image/*"
            :url="uploadUrl"
            :headers="{ 'X-Requested-With': 'XMLHttpRequest' }"
            @imagechanged="imagechanged"
            @imageuploading="imageuploading"
            @errorhandle="errorhandle"
            @imageuploaded="imageuploaded"></vue-core-image-upload>
    </div>
</template>
<script>
    import api from '../routers/api';

    export default {
        props: ['slide'],
        data() {
            return {
                imageSrc: ''
            }
        },
        created() {
            this.imageSrc = this.slide.image_url_thumb;
        },
        computed: {
            uploadUrl() {
                return api.route('slideshows-image-upload');
            }
        },
        methods: {
            imageuploaded(response) {
                this.imageSrc = response.images.image_url_thumb;
                this.eventHub.$emit('slide-updated', Object.assign(this.slide, response.images, Object.assign(this.slide.data, { crop: response.crop })));
            },
            /**
             * return file object
             */
            imagechanged(res) {
              console.log(res.name)
            },
            /**
             * uploading image
             */
            imageuploading(res) {
              console.info('uploading');
            },
            /**
             * handle some error like ajax not working
             */
            errorhandle(e) {
              console.error('error', e);
            }
        }
    }
</script>
