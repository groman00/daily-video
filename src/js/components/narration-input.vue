<template>
    <div>
        <loading-indicator v-if="isLoading"/>
        <template v-else>
            <h4 class="control-header">Narration</h4>
            <template v-if="file">
                <div class="form-control">
                    <button class="button button-blue" @click="clear">
                        Clear
                    </button>
                </div>
                <div class="form-control">
                    <input type="range" min="-30" max="30" step="1" v-model="level" @change="updated">
                    <span class="form-control-hint">Track Level: {{ level }}</span>
                </div>
                <div class="form-control">
                    {{ name }}
                </div>
            </template>
            <div v-show="!file" class="form-control">
                <label class="button button-blue button-input">
                    <input ref="audio" type="file" accept=".mp3" @change="upload">
                    Select File
                </label>
            </div>
        </template>
    </div>
</template>
<script>
    import api from '../routers/api';

    export default {
        props: ['narrationData'],
        data() {
            return {
                isLoading: false,
                level: 0,
                name: null,
                file: null
            };
        },
        watch: {
            narrationData(data) {
                if (data) {
                    this.level = data.level;
                    this.name = data.name;
                    this.file = data.file;
                }
            }
        },
        methods: {
            clear() {
                this.$refs.audio.value = '';
                this.file = null;
                this.name = null;
                this.level = 0;
                this.updated();
            },
            upload() {
                const file = this.$refs.audio.files[0];
                const formData = new FormData();
                formData.append('file', file, file.name);
                this.isLoading = true;
                this.$http.post(api.route('slideshows-audio-upload'), formData)
                    .then((response) => {
                        this.name = response.body.name;
                        this.file = response.body.file;
                        this.isLoading = false;
                        this.updated();
                    });
            },
            updated() {
                this.eventHub.$emit('slideshow-data-updated', {
                    narration: {
                        file: this.file,
                        name: this.name,
                        level: this.level
                    }
                });
            }
        }
    }
</script>
