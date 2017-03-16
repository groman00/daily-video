<style scoped></style>
<template>
    <div class="video-toolbar">
        <div class="grid">
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
                    <!-- Need to show selected file name.  Need to be able to remove file. -->
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
        data() {
            return {
                isPreview: true,
                isPlayingAudio: false,
                audioTrack: '',
                audioTrackLevel: '0',
                audioTracks: [
                    'Frosted_Glass.mp3',
                    'Gentle_Marimbas.mp3',
                    'Orange_Juicier.mp3'
                ]
            }
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
                this.onSubmit({
                    audioTrack: this.audioTrack,
                    audioTrackLevel: this.audioTrackLevel,
                    narrationTrack: this.$refs.audio.files[0],
                    isPreview: this.isPreview
                });
            },
            audioPreview() {
                this.isPlayingAudio = this.$refs.audioTrackPreview.paused;
            }
        }
    }
</script>
