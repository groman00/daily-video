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
            <!--  -->
            <!--
                We should be triggering an api call here to create a new slideshow.
                Get the slideshow id and then navigating to the editor.  The editor should essentially control the
                slideshow data in amp.
            -->
            <!--  -->
            <div class="cell-m-4" >
                <router-link :to="{ name: 'video-new'}" exact>
                    <thumbnail size="large" title="Create New" image=""></thumbnail>
                </router-link>
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
                slideshows: []
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
            }
        }
    }
</script>
