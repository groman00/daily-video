<style scoped></style>
<template>
    <div class="video-toolbar">
        <section class="section section-sound clearfix">
            <div class="section-header">Sound</div>
            <div class="control control-left">
                <div class="control-body">
                    <h4 class="control-header">Music</h4>
                    <div class="form-control">
                        <select v-model="audioTrack">
                            <option value="" selected>
                                Select Audio
                            </option>
                            <option v-for="track in audioTracks" :value="track">
                                {{ track.replace('_', ' ').replace('.mp3', '') }}
                            </option>
                        </select>
                    </div>
                    <div class="form-control">
                        <input type="range" min="-30" max="30" step="1" v-model="audioTrackLevel">
                        <span class="form-control-hint">Track Level: {{ audioTrackLevel }}</span>
                    </div>
                    <div class="form-control">
                        <button class="button button-blue" :disabled="audioTrack === ''" @click="audioPreview">{{ isPlayingAudio ? 'Stop' : 'Preview' }}</button>
                        <audio v-if="audioTrack" ref="audioTrackPreview" style="display:none;" :src="'/fixtures/' + audioTrack"></audio>
                    </div>
                </div>
            </div>
            <div class="control control-right">
                <div class="control-body">
                    <h4 class="control-header">Narration</h4>
                    <div class="form-control">
                        <button v-show="narrationTrack" class="button button-blue" @click="clearNarrationTrack">
                            Clear
                        </button>
                        <label v-show="!narrationTrack" class="button button-blue button-input">
                            <input ref="audio" type="file" accept=".mp3" @change="updateNarrationTrackName">
                            Select File
                        </label>
                    </div>
                    <div class="form-control">
                        <input type="range" min="-30" max="30" step="1" v-model="narrationTrackLevel">
                        <span class="form-control-hint">Track Level: {{ narrationTrackLevel }}</span>
                    </div>
                    <div class="form-control">
                        {{ narrationTrack.name }}
                    </div>
                </div>
            </div>
        </section>
        <section class="section section-export">
            <div class="section-header">export</div>
            <div class="control">
                <div class="control-body">
                    <div class="form-control">
                        <button class="button button-blue button-huge" :disabled="isDisabled" @click="submit">Generate Video</button>
                        <button class="button button-blue" @click="save">Save Project</button>
                        <label class="checkbox">
                            <input type="checkbox" v-model="isPreview"> Select for low-resolution
                        </label>
                    </div>
                    <div class="form-control">
                        <progress-bar></progress-bar>
                    </div>
                </div>
            </div>
        </section>


        <!-- <div class="grid">
            <div class="cell-m-4">
                <div class="form-control">
                    <label style="display:block;width:50%;">
                        Audio Track:
                        <select v-model="audioTrack">
                            <option value="" selected>
                                No Audio
                            </option>
                            <option v-for="track in audioTracks" :value="track">
                                {{ track.replace('_', ' ').replace('.mp3', '') }}
                            </option>
                        </select>
                    </label>
                    <input type="range" min="-30" max="30" step="1" v-model="audioTrackLevel">
                    <span>Audio Track Level: {{ audioTrackLevel }}</span>
                    <button class="button" :disabled="audioTrack === ''" @click="audioPreview">{{ isPlayingAudio ? 'Stop' : 'Preview' }}</button>
                    <audio v-if="audioTrack" ref="audioTrackPreview" style="display:none;" :src="'/fixtures/' + audioTrack"></audio>
                </div>
                <div class="form-control">
                    Narration Track: <input ref="audio" type="file" name="audio" accept=".mp3">
                </div>
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
        </div> -->


    </div>
</template>
<script>
    export default {
        props: {
            onSubmit: {
                type: Function,
                default: Function.prototype,
                required: false
            },
            onSave: {
                type: Function,
                default: Function.prototype,
                required: false
            }
        },
        data() {
            return {
                isPreview: true,
                isPlayingAudio: false,
                isDisabled: false,
                audioTrack: '',
                audioTrackLevel: '0',
                narrationTrackLevel: '0',
                narrationTrack: '',
                audioTracks: [
                    'Frosted_Glass.mp3',
                    'Gentle_Marimbas.mp3',
                    'Orange_Juicier.mp3'
                ]
            }
        },
        created() {
            this.eventHub.$on('render-complete', this.renderComplete);
            this.eventHub.$on('video-rendering', this.disableSubmit);
        },
        beforeDestroy() {
            this.eventHub.$off('render-complete', this.renderComplete);
            this.eventHub.$off('video-rendering', this.disableSubmit);
        },
        watch: {
            audioTrack() {
                this.isPlayingAudio = false;
            },
            isPlayingAudio(bool) {
                const track = this.$refs.audioTrackPreview;
                if (bool) {
                    track.currentTime = 0;
                }
                track[bool ? 'play' : 'pause']();
            }
        },
        methods: {
            submit() {
                //this.isDisabled = true;
                this.onSubmit({
                    audioTrack: this.audioTrack,
                    audioTrackLevel: this.audioTrackLevel,
                    narrationTrack: this.narrationTrack,
                    narrationTrackLevel: this.narrationTrackLevel,
                    isPreview: this.isPreview
                });
            },
            save() {
                this.onSave();
            },
            disableSubmit() {
                this.isDisabled = true;
            },
            audioPreview() {
                this.isPlayingAudio = this.$refs.audioTrackPreview.paused;
            },
            updateNarrationTrackName() {
                console.log(this.$refs.audio.files[0]);
                this.narrationTrack = this.$refs.audio.files[0];
            },
            clearNarrationTrack() {
                this.narrationTrack = '';
                this.narrationTrackLevel = 0;
                this.$refs.audio.value = '';
            },
            renderComplete() {
                this.isDisabled = false;
            }
        }
    }
</script>
