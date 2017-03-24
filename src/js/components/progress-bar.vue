<style scoped></style>
<template>
    <div class="progress-bar">
        <div class="progress-bar-track">
            <div class="progress-bar-fill" :style="{ 'width': (progress * 100) + '%'}"></div>
        </div>
        <template v-if="downloadLink">
            <a class="button button-blue download-link pull-right" style="margin-left: 12px;" @click="uploadVideo">Upload Video</a>
            <a class="button button-blue download-link pull-right" :href="downloadLink">Save Video</a>
        </template>
        <h3 class="progress-bar-label">{{ label }}</h3>
    </div>
</template>
<script>
    import api from '../routers/api';

    export default {
        data() {
            return {
                label: ' ',
                progress: 0,
                downloadLink: ''
            }
        },
        created() {
            /**
             * Should this code be in the video editor, and the event hub can broadcast the progress events?
             */
            this.$root.socket.on('progress', this.showProgress);
            this.$root.socket.on('complete', this.showComplete);
            this.$root.socket.on('jobError', this.showError);
        },
        beforeDestroy() {
            this.$root.socket.off('progress', this.showProgress);
            this.$root.socket.off('complete', this.showComplete);
            this.$root.socket.off('jobError', this.showError);
        },
        methods: {
            showProgress(data) {
                // console.log(this.progress);
                this.label = data.message;
                this.progress = data.progress ? data.progress : 1;
            },
            showComplete(data) {
                this.label = 'Render Complete';
                this.progress = 0;
                this.downloadLink = data.file;
                this.eventHub.$emit('render-complete');
            },
            showError(error) {
                this.label = error;
                this.progress = 0;
                this.eventHub.$emit('render-complete');
            },
            uploadVideo() {
                const data = {
                    name: 'Daily Video Ingestion ' + Date.now(),
                    file: this.downloadLink.split('/').pop()
                };
                this.$http.post(api.route('vidible-upload'), data)
                    .then((response) => {
                        console.log(response);
                        alert('Upload Complete!  Files will be available in the uploads queue shortly.');
                    }, (response) => {
                        console.log('error', response);
                    });
            }
        }
    }
</script>
