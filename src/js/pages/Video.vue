<style scoped></style>
<template>
    <div class="page-wrapper">
        <app-bar :config="{ buttonLeft: 'back' }" :onBackButton="goBack"></app-bar>
        <div v-if="slides.length" class="grid">
            <div class="cell-m-4" v-for="slide in slides" key="slide.id">
                <thumbnail :title="slide.title" :image="slide.image_url_thumb"></thumbnail>
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
