<style scoped></style>
<template>
    <div class="home-page page-wrapper">
        <app-bar :config="{ title: 'Projects' }"></app-bar>
        <div class="flex-grow-1 flex-overflow">
            <div v-if="hasError" class="grid text-center">
                <div class="cell-m-12">
                    <h1>An Error Occurred</h1>
                </div>
                <div class="cell-m-12">
                    <button class="button button-blue" :disabled="isFetching" @click="fetchData">Try Again</button>
                </div>
            </div>
            <div v-else class="grid">
                <div class="media cell-m-12">
                    <div class="media-left">
                        <a href="#" @click.prevent="createNew">
                            <img src="https://s3.amazonaws.com/alpha-global-origin/daily-video/add-new.png" class="media-image"/>
                        </a>
                    </div>
                    <div class="media-body">
                        <a href="#" @click.prevent="createNew">
                            Create New
                        </a>
                    </div>
                </div>
                <div class="cell-m-12">
                    <div class="pagination">
                        Pages:
                        <span class="pagination-link" v-for="index in pages" key="index">
                            <router-link v-if="index === 1" :to="{ name: 'home'}" exact>{{ index }}</router-link>
                            <router-link v-else key="index" :to="{ name: 'home-paginated', params: { page: index } }" exact>{{ index }}</router-link>
                        </span>
                    </div>
                </div>
                <template v-if="slideshows.length">
                <div class="media cell-m-6" v-for="slideshow in slideshows" key="slideshow.id">
                    <div class="media-left">
                        <router-link v-if="slideshow" :to="{ name: 'video', params: { id: slideshow.id } }" exact>
                            <img :src="slideshow.image_url_thumb" class="media-image"/>
                        </router-link>
                    </div>
                    <div class="media-body">
                        <router-link v-if="slideshow" :to="{ name: 'video', params: { id: slideshow.id } }" exact>
                            {{ slideshow.title }}
                        </router-link>
                    </div>
                </div>
                </template>
                <template v-else>
                    <loading-indicator></loading-indicator>
                </template>
            </div>
        </div>
        <overlay v-show="!hasError" :open="isCreatingNew">
            <template slot="overlay-content">
                <br><br>
                <h2 class="text-center">Creating New Project</h2>
            </template>
        </overlay>
    </div>
</template>
<script>
    import api from '../routers/api';

    import { fillIndexedArray } from '../lib/helpers';

    export default {
        data() {
            return {
                page: null,
                pages: [],
                slideshows: [],
                isCreatingNew: false,
                hasError: false,
                isFetching: false
            }
        },
        created() {
            this.page = this.$route.params.page || 1
        },
        watch: {
            '$route' (to, from) {
                this.page = to.params.page || 1;
            },
            page(value) {
                this.fetchData();
            }
        },
        methods: {
            fetchData() {
                this.isFetching = true;
                this.hasError = false;
                this.slideshows = [];
                this.$http.get(api.route('slideshows', { page: this.page }))
                    .then((response) => {
                        this.slideshows = response.body.results;
                        this.setPages(response.body.total_pages);
                    }, error => {
                        this.hasError = true;
                    })
                    .then(() => {
                        this.isFetching = false;
                    });
            },
            setPages(total) {
                let pages = fillIndexedArray(total + 1);
                pages.shift();
                this.pages = pages;
            },
            createNew() {
                this.isFetching = true;
                this.hasError = false;
                this.isCreatingNew = true;
                this.$http.post(api.route('create-project'))
                    .then((response) => {
                         this.$router.push({ name: 'video', params: { id: response.body.id }});
                    }, error => {
                        this.hasError = true;
                    })
                    .then(() => {
                        this.isCreatingNew = false;
                        this.isFetching = false;
                    });
            }
        }
    }
</script>
