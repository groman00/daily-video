<style scoped></style>
<template>
    <div class="app-bar flex-shrink-0">
        <router-link v-if="config.buttonLeft === 'back'" :to="{ name: 'home' }" exact class="button button-blue button-left">
            &lsaquo; All Projects
        </router-link>
        <h1 v-if="config.title" class="app-bar-title text-center">{{ config.title }}</h1>
        <router-link :to="{ name: 'uploads' }" exact class="button button-blue button-right">
            Uploads
        </router-link>
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
