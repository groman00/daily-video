<style scoped></style>
<template>
    <div class="video-editor">
        <div class="grid grid-small">
            <div class="cell-m-4" v-for="(slide, index) in slides" key="slide.id">
                <video-editor-item :slideshowId="slideshowId" :slide="slide" :slideTypes="slideTypes" :slideIndex="index" :slideCount="slides.length" :theme="theme"></video-editor-item>
            </div>
            <slide-new :slideshowId="slideshowId" :slideCount="slides.length"></slide-new>
        </div>
    </div>
</template>
<script>
    export default {
        props: ['slideshowId', 'slides', 'slideTypes', 'theme']
    }
</script>
