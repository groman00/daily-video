<style scoped></style>
<template>
    <div class="uploads-page page-wrapper">
        <app-bar :config="{ buttonLeft: 'back', title: title }" :onBackButton="goBack"></app-bar>
        <div v-if="videos.length" class="grid">
            <div class="cell-m-12 fg-white">
                <h1>Uploaded Videos</h1>
            </div>
            <div class="cell-m-12" v-for="video in videos" key="video.id">
                <div class="list-group">
                    <div class="list-group-header">
                        <h2>{{ video.name }}</h2>
                    </div>
                    <div class="list-group-subheader">
                        <a :href="video.audioUrl" target="_blank">Download Audio Track</a>
                    </div>
                    <div class="list-group-subheader">
                        <h3>Renditions</h3>
                    </div>
                    <div class="list-group-item" v-for="rendition in video.encodedVariants" key="rendition.videoUrl">
                        <a :href="rendition.videoUrl" target="_blank">{{ rendition.videoUrl }}</a>
                    </div>
                </div>
            </div>
        </div>
        <loading-indicator v-else></loading-indicator>
    </div>
</template>
<script>
    import api from '../routers/api';

    export default {
        data() {
            return {
                videos: []
            }
        },
        created() {
            this.fetchData();
        },
        methods: {
            fetchData() {
                this.$http.get(api.route('vidible-uploads'))
                    .then((response) => {
                        console.log(response);
                        this.videos = response.body.data;
                        //this.slideshows = response.body.results;
                    }, (response) => {
                        // console.log('error', response);
                    });
            }
        }
    }
</script>
