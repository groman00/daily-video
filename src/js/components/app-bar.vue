<style scoped></style>
<template>
    <div class="app-bar">
        <button v-if="config.buttonLeft === 'back'" class="button button-left" @click="backButtonClicked">
            <!-- <icon name="arrow-back"/>  -->
            All Projects
        </button>
    </div>
</template>
<script>
    export default {
        props: {
            config: {
                type: Object,
                default: {
                    buttonLeft: null
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
