<style scoped></style>
<template>
    <div class="video-toolbar" :class="{ 'minimized': isMinimized }">
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
                <button class="section-header-item pull-right button button-arrow-vertical" :class="{ 'up': isMinimized }" @click="toggleMinimize"></button>
                <span class="section-header-item pull-right text-transform-none">Approx Duration: {{ formattedVideoDuration }}s</span>
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
                            <!-- <select style="margin-top:6px;" @change="formatUpdated($event.target.value)"> -->
                            <select style="margin-top:6px;" v-model="format">
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
    import { formatSeconds, getCookie, setCookie } from '../lib/helpers';

    const themeCookie = 'video-theme';
    const formatCookie = 'video-format';

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
                format: 'square',
                isPreview: true,
                isPlayingAudio: false,
                isDisabled: false,
                audioTrack: '',
                audioTrackLevel: '0',
                isMinimized: false
            }
        },
        created() {
            this.eventHub.$on('render-complete', this.renderComplete);
            this.format = getCookie(formatCookie) || this.format;
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
                this.theme = getCookie(themeCookie) || Object.keys(themesObj)[0];
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
            },
            format(value) {
                this.$emit('formatUpdated', value);
                setCookie(formatCookie, value);
            }
        },
        methods: {
            themeUpdated(theme) {
                this.$emit('themeUpdated', theme);
                setCookie(themeCookie, theme);
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
                    isPreview: this.isPreview
                };
            },
            audioPreview() {
                this.isPlayingAudio = this.$refs.audioTrackPreview.paused;
            },
            renderComplete() {
                this.isDisabled = false;
            },
            toggleMinimize() {
                this.isMinimized = !this.isMinimized;
            }
        }
    }
</script>
