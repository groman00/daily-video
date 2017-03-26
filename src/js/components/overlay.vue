<style scoped></style>
<template>
    <div class="overlay" v-bind:class="{ 'open': isOpen }">
        <slot name="overlay-content"></slot>
    </div>
</template>
<script>
    export default {
        data() {
            return {
                isOpen: false
            }
        },
        created() {
            this.eventHub.$on('open-overlay', this.open);
            this.eventHub.$on('close-overlay', this.close);
        },
        beforeDestroy() {
            this.eventHub.$off('open-overlay', this.open);
            this.eventHub.$off('close-overlay', this.close);
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
