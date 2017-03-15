<style scoped></style>
<template>
    <div class="video-toolbar">
        <div class="grid">
            <div class="cell-m-4">
                Audio File: <input ref="audio" type="file" name="audio" accept=".mp3">
            </div>
            <div class="cell-m-4">

            </div>
            <div class="cell-m-4">
                <button class="button pull-right" @click="submit">Generate Video</button>
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
            }
        }
    }
</script>
