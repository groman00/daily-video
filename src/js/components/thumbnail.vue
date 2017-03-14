<style scoped></style>
<template>
    <div class="thumbnail text-center" :class="[size ? 'thumbnail-' + size : '']">
        <img class="thumbnail-image" :src="image" :alt="title">
        <p class="thumbnail-title">{{ title }}</p>
    </div>
</template>
<script>
    export default {
        props: ['title', 'image', 'size']
    }
</script>
