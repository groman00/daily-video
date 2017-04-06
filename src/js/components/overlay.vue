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
        created() {
            //this.isOpen = this.open;
            // this.eventHub.$on('open-overlay', this.open);
            // this.eventHub.$on('close-overlay', this.close);
        },
        watch: {
            open(bool) {
                this.isOpen = bool;
            }
        },
        beforeDestroy() {
            // this.eventHub.$off('open-overlay', this.open);
            // this.eventHub.$off('close-overlay', this.close);
        },
        methods: {
            open() {
                this.isOpen = true;
            },
            close() {
                this.isOpen = false;
            }
        }
    }
</script>
