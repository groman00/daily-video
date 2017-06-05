<style scoped></style>
<template>
    <div class="video-editor-item new text-center">
        <button :disabled="loading" class="button button-blue" @click="addNew">+ Add Slide</button>
    </div>
</template>
<script>
    import api from '../routers/api';

    export default {
        props: ['slideshowId'],
        data() {
            return {
                loading: false
            }
        },
        methods: {
            addNew() {
                this.loading = true;
                this.$http.post(api.route('slideshows-add-slide'), { slideshow_id: this.slideshowId })
                    .then((response) => {
                        this.eventHub.$emit('slide-added', response.body);
                    }, (response) => {
                        // console.log('error', response);
                    })
                    .then(() => {
                        this.loading = false;
                    });
            }
        }
    }
</script>
