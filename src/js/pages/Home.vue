<style scoped></style>
<template>
    <div class="home-page page-wrapper">
        <app-bar></app-bar>
        <div v-if="slideshows.length" class="grid flex-grow-1">
            <div class="cell-m-4" v-for="slideshow in slideshows" key="slideshow.id">
                <router-link v-if="slideshow" :to="{ name: 'video', params: { id: slideshow.id } }" exact>
                    <thumbnail size="large" :title="slideshow.title" :image="slideshow.image_url_thumb"></thumbnail>
                </router-link>
            </div>
            <div class="cell-m-4" >
                <a href="#" @click.prevent="createNew">
                    <thumbnail size="large" title="Create New" image="https://s3.amazonaws.com/alpha-global-origin/daily-video/add-new.png"></thumbnail>
                </a>
            </div>
        </div>
        <loading-indicator v-else></loading-indicator>
        <overlay :open="isCreatingNew">
            <template slot="overlay-content">
                <br><br>
                <h2 class="text-center">Creating New Project</h2>
            </template>
        </overlay>
    </div>
</template>
<script>
    import api from '../routers/api';

    export default {
        data() {
            return {
                slideshows: [],
                isCreatingNew: false
            }
        },
        created() {
            this.fetchData();
        },
        methods: {
            fetchData() {
                this.$http.get(api.route('slideshows'))
                    .then((response) => {
                        this.slideshows = response.body.results;
                    }, (response) => {
                        // console.log('error', response);
                    });
            },
            createNew() {
                this.isCreatingNew = true;
                this.$http.post(api.route('create-project'))
                    .then((response) => {
                         this.$router.push({ name: 'video', params: { id: response.body.id }});
                    }, (error) => {
                        alert('Something went wrong.  Please refresh and try again.');
                    });
            }
        }
    }
</script>
