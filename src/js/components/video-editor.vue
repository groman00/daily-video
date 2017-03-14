<style scoped></style>
<template>
    <div class="video-editor">
        <div v-if="slides.length" class="grid grid-small">
            <div class="cell-m-4" v-for="slide in slides" key="slide.id">
                <thumbnail :image="slide.image_url_thumb"></thumbnail>
                <select v-model="slide.template">
                    <option v-for="template in templates" :value="template">
                        {{ template.title }}
                    </option>
                </select>
                <input v-model="slide.title" placeholder="Add a title" :value="slide.title">
                <textarea v-model="slide.caption" placeholder="Add a caption">
                    {{ slide.caption }}
                </textarea>
                <label>
                    <input type="checkbox" v-model="slide.bumper"> Add Bumper
                </label>
            </div>
        </div>
        <loading-indicator v-else></loading-indicator>
    </div>
</template>
<script>
    export default {
        props: ['slides', 'templates']

    }
</script>
