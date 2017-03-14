<style scoped></style>
<template>
    <div class="video-toolbar">
        <h3>Video Toolbar</h3>
        <button @click="submit">Generate Video</button>
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
            }
        }
    }
</script>
