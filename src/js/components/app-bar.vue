<style scoped></style>
<template>
    <div class="app-bar flex-shrink-1">
        <div class="flex-rows">
            <div class="button-group flex-shrink-1">
                <router-link v-if="config.buttonLeft === 'back'" :to="{ name: 'home' }" exact class="button button-blue">
                    &lsaquo; All Projects
                </router-link>
            </div>
            <h1 class="app-bar-title form-control text-center flex-grow-1">
                <input v-if="config.title" v-model="config.title" type="text" @blur="titleUpdated($event.target.value)">
            </h1>
            <div class="button-group flex-shrink-1">
                <a class="button button-blue" href="https://s3.amazonaws.com/alpha-global-origin/daily-video/Video_Tool_Tutorial.mp4" target="_blank">View Tutorial</a>
                <router-link :to="{ name: 'uploads' }" exact class="button button-blue">
                    Uploads
                </router-link>
            </div>
        </div>
    </div>
</template>
<script>
    export default {
        props: {
            config: {
                type: Object,
                default() {
                    return {
                        buttonLeft: null,
                        title: ''
                    }
                },
                required: false
            }
        },
        methods: {
            titleUpdated(title) {
                this.$emit('titleUpdated', title);
            }
        }
    }
</script>
