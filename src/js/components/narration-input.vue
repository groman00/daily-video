<template>
    <div>
        <loading-indicator v-if="isLoading"/>
        <template v-else>
            <h4 class="control-header">Narration</h4>
            <div class="form-control">
                <button v-show="file" class="button button-blue" @click="clear">
                    Clear
                </button>
                <label v-show="!file" class="button button-blue button-input">
                    <input ref="audio" type="file" accept=".mp3" @change="upload">
                    Select File
                </label>
            </div>
            <div class="form-control">
                <input type="range" min="-30" max="30" step="1" v-model="level">
                <span class="form-control-hint">Track Level: {{ level }}</span>
            </div>
            <div class="form-control">
                {{ name }}
            </div>
        </template>
    </div>
</template>
<script>
    import api from '../routers/api';

    export default {
        data() {
            return {
                isLoading: false,
                level: 0,
                name: null,
                file: null
            };
        },
        methods: {
            clear() {
                this.file = null;
                this.name = null;
                this.level = 0;
                this.$refs.audio.value = '';
            },
            upload() {
                const file = this.$refs.audio.files[0];
                const formData = new FormData();
                formData.append('file', file, file.name);
                this.isLoading = true;
                this.$http.post(api.route('slideshows-audio-upload'), formData)
                    .then((response) => {
                        console.log(response);
                        this.name = response.body.name;
                        this.file = response.body.source;
                        this.isLoading = false;
                    });
            }
        }
    }
</script>
