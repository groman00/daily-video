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
                <narration-input class="control-body" :narrationData="slideshow.data ? slideshow.data.narration : {}"/>
            </div>
        </section>
        <section class="section section-export">
            <div class="section-header">
                export
                <span class="pull-right text-transform-none">Approx Duration: {{ formattedVideoDuration }}s</span>
            </div>
            <div class="control">
                <div class="control-body">
                    <div class="form-control clearfix">
                        <div class="pull-left" style="width:48%;">
                            <label>Theme</label>
                            <select v-model="theme" style="margin-top:6px;" @change="themeUpdated($event.target.value)">
                                <option v-for="(val, key) in themes" :value="key">
                                    {{ key }}
                                </option>
                            </select>
                        </div>
                        <div class="pull-right" style="width:48%;">
                            <label>Format</label>
                            <select style="margin-top:6px;" @change="formatUpdated($event.target.value)">
                                <option v-for="f in formats" :value="f">
                                    {{ f }}
                                </option>
                            </select>
                        </div>
                    </div>
                    <div class="form-control">
                        <button class="button button-blue button-huge" :disabled="isDisabled" @click="submit">Generate Video</button>
                        <label class="checkbox">
                            <input type="checkbox" v-model="isPreview"> Select for low-resolution
                        </label>
                    </div>
                    <div class="form-control">
                        <progress-bar :title="slideshow.title"></progress-bar>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>
<script>
    import { formatSeconds } from '../lib/helpers';

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
            },
            slideshow: {
                type: Object,
                required: true
            },
            themes: {
                type: Object,
                required: true
            },
            audioTracks: {
                type: Array,
                required: true
            },
            videoDuration: {
                type: Number,
                required: true
            }
        },
        data() {
            return {
                theme: '',
                formats: ['square', 'landscape'],
                isPreview: true,
                isPlayingAudio: false,
                isDisabled: false,
                audioTrack: '',
                audioTrackLevel: '0',
                // narrationTrackLevel: '0',
                // narrationTrack: ''
            }
        },
        created() {
            this.eventHub.$on('render-complete', this.renderComplete);
        },
        beforeDestroy() {
            this.eventHub.$off('render-complete', this.renderComplete);
        },
        computed: {
            formattedVideoDuration() {
                return formatSeconds(this.videoDuration);
            }
        },
        watch: {
            themes(themesObj) {
                this.theme = Object.keys(themesObj)[0];
                this.themeUpdated(this.theme);
            },
            audioTrack() {
                this.isPlayingAudio = false;
            },
            isPlayingAudio(bool) {
                const track = this.$refs.audioTrackPreview;
                if (bool) {
                    track.currentTime = 0;
                }
                track[bool ? 'play' : 'pause']();
            },
            slideshow() {
                this.audioTrack = this.slideshow.audioTrack || '';
                this.audioTrackLevel = this.slideshow.audioTrackLevel || '0';
            }
        },
        methods: {
            themeUpdated(theme) {
                this.$emit('themeUpdated', theme);
            },
            formatUpdated(format) {
                this.$emit('formatUpdated', format);
            },
            submit() {
                this.isDisabled = true;
                this.onSubmit(this.getSettings());
            },
            save() {
                this.onSave(this.getSettings());
            },
            getSettings() {
                return {
                    audioTrack: this.audioTrack,
                    audioTrackLevel: this.audioTrackLevel,
                    // narrationTrack: this.narrationTrack,
                    // narrationTrackLevel: this.narrationTrackLevel,
                    isPreview: this.isPreview
                };
            },
            audioPreview() {
                this.isPlayingAudio = this.$refs.audioTrackPreview.paused;
            },
            // updateNarrationTrackName() {
            //     console.log(this.$refs.audio.files[0]);
            //     this.narrationTrack = this.$refs.audio.files[0];
            // },
            // clearNarrationTrack() {
            //     this.narrationTrack = '';
            //     this.narrationTrackLevel = 0;
            //     this.$refs.audio.value = '';
            // },
            renderComplete() {
                this.isDisabled = false;
            }
        }
    }
</script>
