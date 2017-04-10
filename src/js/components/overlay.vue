<style scoped></style>
<template>
    <div class="overlay" v-bind:class="{ 'open': isOpen }">
        <slot name="overlay-content"></slot>
    </div>
</template>
<script>
    export default {
        props: ['open'],
        data() {
            return {
                isOpen: false
            }
        },
        watch: {
            open(bool) {
                this.isOpen = bool;
            }
        },
        methods: {
            // open() {
            //     this.isOpen = true;
            // },
            // close() {
            //     this.isOpen = false;
            // }
        }
    }
</script>
