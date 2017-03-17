<style scoped></style>
<template>
    <div class="video-editor-item">
        <thumbnail :image="slide.image_url_thumb"></thumbnail>
        <div class="form-control">
            <select v-model="slide.template" @change="itemUpdated">
                <option v-for="template in templates" v-if="template.visible" :value="template">
                    {{ template.title }}
                </option>
            </select>
        </div>
        <div class="form-control">
            <input v-model="slide.title" placeholder="Add a title" :value="slide.title" type="text" @change="itemUpdated">
        </div>
        <div class="form-control">
            <textarea v-model="slide.caption" placeholder="Add a caption" @change="itemUpdated">
                {{ slide.caption }}
            </textarea>
        </div>
        <div class="form-control">
            <label class="checkbox">
                <input type="checkbox" v-model="slide.bumper" @change="itemUpdated"> Add Bumper
            </label>
        </div>
        <div class="form-control">
            <button class="button button-blue" @click="showPreview(slide)">Preview</button>
        </div>
    </div>
</template>
<script>
    export default {
        props: ['slide', 'templates'],
        data() {
            return {
                hasPreview: false,
                previewTimestamp: undefined
            }
        },
        created() {
            this.previewTimestamp = this.getTimestamp();
        },
        methods: {
            showPreview(slide) {
                this.eventHub.$emit('fetch-preview', ...[slide, this.hasPreview, this.previewTimestamp]);
                this.hasPreview = true;
            },
            itemUpdated() {
                this.previewTimestamp = this.getTimestamp();
                this.hasPreview = false;
            },
            getTimestamp() {
                return '_' + new Date().getTime();
            }
        }
    }
</script>
