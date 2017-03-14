<style scoped></style>
<template>
    <div class="video-preview">
        <video class="video" controls playsinline preload="none" :src="src"></video>
    </div>
</template>
<script>
    export default {
        props: ['src']
    }
</script>
