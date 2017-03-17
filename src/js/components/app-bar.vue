<style scoped></style>
<template>
    <div class="app-bar flex-shrink-0">
        <button v-if="config.buttonLeft === 'back'" class="button button-blue button-left" @click="backButtonClicked">
            &lsaquo; All Projects
        </button>
        <h1 v-if="config.title" class="app-bar-title text-center">{{ config.title }}</h1>
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
            },
            onBackButton: {
                type: Function,
                default: Function.prototype,
                required: false
            }
        },
        methods: {
            backButtonClicked() {
                this.onBackButton();
            }
        }
    }
</script>
