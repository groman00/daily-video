<style scoped></style>
<template>
    <div class="uploads-page page-wrapper">
        <app-bar :config="{ buttonLeft: 'back', title: 'Uploaded Videos' }" :onBackButton="goBack"></app-bar>
        <div v-if="videos.length" class="grid">
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
                        <a href="#" @click.prevent="shareLink(rendition.videoUrl)">{{ linkName(rendition) }}</a>
                    </div>
                </div>
            </div>
        </div>
        <loading-indicator v-else></loading-indicator>
    </div>
</template>
<script>
    import api from '../routers/api';

    const dummyAnchor = document.createElement('A');

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
                    }, (response) => {
                        // console.log('error', response);
                    });
            },
            linkName(video) {
                dummyAnchor.href = video.videoUrl;
                return `${video.width}x${video.height} ${dummyAnchor.pathname.split('.').pop().toUpperCase()}`;
            },
            shareLink(url) {
                window.prompt("Copy link to share", url);
            }
        }
    }
</script>
