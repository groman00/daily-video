<style scoped></style>
<template>
    <div class="video-editor">
        <div v-if="slides.length" class="grid grid-small">
            <div class="cell-m-4" v-for="slide in slides" key="slide.id">
                <thumbnail :title="slide.title" :image="slide.image_url_thumb"></thumbnail>
            </div>
        </div>
        <loading-indicator v-else></loading-indicator>
    </div>
</template>
<script>
    export default {
        props: ['slides']
    }
</script>
