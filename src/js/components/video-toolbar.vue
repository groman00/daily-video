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
            <div class="cell-m-4">
                <div class="button-group pull-right">
                    <button class="button" @click="submit">Generate Video</button>
                    <button class="button" @click="generatePreview">Generate Preview</button>
                </div>
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
