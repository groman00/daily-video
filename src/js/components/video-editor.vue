<style scoped></style>
<template>
    <div class="video-editor">
        <div class="grid grid-small">
            <div class="cell-m-4" v-for="slide in slides" key="slide.id">
                <video-editor-item :slide="slide" :templates="templates"></video-editor-item>
            </div>
        </div>
    </div>
</template>
<script>
    export default {
        props: ['slides', 'templates']
    }
</script>
