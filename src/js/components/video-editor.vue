<style scoped></style>
<template>
    <div class="video-editor">
        <div v-if="slides.length" class="grid grid-small">
            <div class="cell-m-4" v-for="slide in slides" key="slide.id">
                <div class="video-editor-item">
                    <thumbnail :image="slide.image_url_thumb"></thumbnail>
                    <div class="form-control">
                        <select v-model="slide.template">
                            <option v-for="template in templates" v-if="template.visible" :value="template">
                                {{ template.title }}
                            </option>
                        </select>
                    </div>
                    <div class="form-control">
                        <input v-model="slide.title" placeholder="Add a title" :value="slide.title" type="text">
                    </div>
                    <div class="form-control">
                        <textarea v-model="slide.caption" placeholder="Add a caption">
                            {{ slide.caption }}
                        </textarea>
                    </div>
                    <div class="form-control">
                        <label>
                            <input type="checkbox" v-model="slide.bumper"> Add Bumper
                        </label>
                    </div>
                    <div class="form-control">
                        <a href="#">Preview</a>
                    </div>
                </div>
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
