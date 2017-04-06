<style scoped></style>
<template>
    <div class="video-editor">
        <div class="grid grid-small">
            <div class="cell-m-4" v-for="slide in slides" key="slide.id">
                <video-editor-item :slide="slide" :slideTypes="slideTypes"></video-editor-item>
            </div>
            <div class="cell-m-4">
                <button class="button button-blue" @click="addNew">+ Add Slide</button>
            </div>
        </div>
    </div>
</template>
<script>
    export default {
        props: ['slides', 'slideTypes'],
        methods: {
            addNew() {

            }
        }
    }
</script>
