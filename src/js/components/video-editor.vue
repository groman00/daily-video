<style scoped></style>
<template>
    <div class="video-editor">
        <div class="grid grid-small">
            <div class="cell-m-4" v-for="slide in slides" key="slide.id">
                <video-editor-item :slide="slide" :slideTypes="slideTypes"></video-editor-item>
            </div>
            <slide-new :slideshowId="slideshowId" :slideCount="slides.length"></slide-new>
        </div>
    </div>
</template>
<script>
    export default {
        props: ['slideshowId', 'slides', 'slideTypes']
    }
</script>
