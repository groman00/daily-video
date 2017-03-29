<style scoped></style>
<template>
    <div class="app-bar flex-shrink-0">
        <h1 v-if="config.title" class="app-bar-title text-center">{{ config.title }}</h1>
        <div class="button-group buttons-left">
            <router-link v-if="config.buttonLeft === 'back'" :to="{ name: 'home' }" exact class="button button-blue">
                &lsaquo; All Projects
            </router-link>
        </div>
        <div class="button-group buttons-right">
            <a class="button button-blue" href="https://s3.amazonaws.com/alpha-global-origin/daily-video/Video_Tool_Tutorial.mp4" target="_blank">View Tutorial</a>
            <router-link :to="{ name: 'uploads' }" exact class="button button-blue">
                Uploads
            </router-link>
        </div>
    </div>
</template>
<script>
    export default {
        props: {
            config: {
                type: Object,
                default: {
                    buttonLeft: null,
                    title: ''
                },
                required: true
            }
            // ,
            // onBackButton: {
            //     type: Function,
            //     default: Function.prototype,
            //     required: false
            // }
        },
        methods: {
            // backButtonClicked() {
            //     this.onBackButton();
            // }
        }
    }
</script>
