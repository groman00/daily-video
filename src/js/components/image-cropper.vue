<style scoped></style>
<template>
    <div>
        <img class="avatar" v-bind:src="src"/>
        <!-- url="http://101.198.151.190/api/crop.php" -->
        <!-- :isXhr="false" -->
        <vue-core-image-upload
            ref="cropper"
            crop-ratio="1:1"
            :class="['button','button-blue','js-btn-crop']"
            :crop="true"
            extensions="png,gif,jpeg,jpg"
            input-accept="image/*"
            :url="uploadUrl"
            :headers="{ 'X-Requested-With': 'XMLHttpRequest' }"
            @imageuploaded="imageuploaded"></vue-core-image-upload>
    </div>
</template>
<script>
    import api from '../routers/api';

    export default {
        data() {
            return {
                src: ''
            }
        },
        computed: {
            uploadUrl() {
                return api.route('slideshows-image-upload');
            }
        },
        methods: {
            imageuploaded(res) {
                console.log(res);
                if (res.errcode == 0) {
                    this.src = res.data.src;
                }
            },
            // return file object
            imagechanged(res) {
              console.log(res.name)
            },
            // uploading image
            imageuploading(res) {
              console.info('uploading');
            },
            // handle some error like ajax not working
            errorhandle(e) {
              console.error('error', e);
            }
        }
    }
</script>
