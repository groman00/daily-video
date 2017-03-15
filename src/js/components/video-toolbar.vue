<style scoped></style>
<template>
    <div class="video-toolbar">
        <div class="grid">
            <div class="cell-m-4">
                Audio File: <input ref="audio" type="file" name="audio" accept=".mp3">
            </div>
            <div class="cell-m-4">
                <progress-bar></progress-bar>
            </div>
            <div class="cell-m-2">
                <button class="button pull-right" @click="submit">Generate Video</button>
            </div>
            <div class="cell-m-2">
                <label>
                    <input type="checkbox" v-model="isPreview"> Low Res Preview
                </label>
            </div>
        </div>
    </div>
</template>
<script>
    export default {
        props: {
            onSubmit: {
                type: Function,
                default: Function.prototype,
                required: false
            }
        },
        data() {
            return {
                isPreview: true
            }
        },
        methods: {
            submit() {
                this.onSubmit();
            },
            getAudioFile() {
                return this.$refs.audio.files[0];
            },
            generatePreview() {
                alert('Coming Soon!');
            }
        }
    }
</script>
