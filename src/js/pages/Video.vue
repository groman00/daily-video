<style scoped></style>
<template>
    <div class="video-page page-wrapper">
        <app-bar :config="{ buttonLeft: 'back' }" :onBackButton="goBack"></app-bar>
        <div class="panels flex-grow-1">
            <div class="panels-top flex-grow-1">
                <div class="panel-left">
                    <video-editor :slides="slides"></video-editor>
                </div>
                <div class="panel-right">
                    <video-preview src="/videos/bumper.mp4"></video-preview>
                </div>
            </div>
            <div class="panels-bottom flex-grow-0">
                <video-toolbar></video-toolbar>
            </div>
        </div>
    </div>
</template>
<script>
    import api from '../routers/api';

    export default {
        data() {
            return {
                slides: []
            }
        },
        created() {
            this.fetchData();
        },
        methods: {
            fetchData() {
                this.$http.get(api.route('slideshow', { id: this.$route.params.id }))
                    .then((response) => {
                        this.slides = response.body.slides;
                    }, (response) => {
                        // console.log('error', response);
                    });
            },
            goBack() {
                this.$router.push({ name: 'home' });
            }
        }
    }
</script>
