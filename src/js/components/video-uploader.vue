<style scoped></style>
<template>
    <div class="video-uploader">
        <div v-show="hasVideo" class="form-control">
            <span class="video-helper-text text-center">( click video to play )</span>
            <video preload="metadata" class="video" ref="video" :src="src" style="width:100%;" @loadedmetadata="videoLoadedMetadata($event.target)" @click="toggleVideo($event.target)" @timeupdate="checkVideoTime($event.target)" @error="videoError"></video>
        </div>
        <div v-show="isLoading" class="form-control">
            <div class="video-placeholder">
                <loading-indicator></loading-indicator>
            </div>
        </div>
        <div v-show="hasVideo" class="form-control">
            <vue-slider v-model="range" :tooltip-dir="['top', 'bottom']" :interval=".1" :min="0" :max="rangeMax" :formatter="timeFormat" @callback="sliderCallback" @drag-end="sliderDragEnd"></vue-slider>
        </div>
        <div class="form-control text-center">
            <button class="button button-blue" :disabled="isLoading" @click="openVideoOverlay">Add Video</button>
        </div>
        <overlay :open="isSelecting">
            <template slot="overlay-content">
                <div class="centered" style="width: 50%;">
                    <div class="form-control text-center">
                        <label class="button button-blue button-input" :disabled="isLoading">
                            <input ref="fileInput" :disabled="isLoading" type="file" accept="video/mp4" @change="fileChanged">
                            {{ isLoading ? 'Uploading...' : 'Upload File' }}
                        </label>
                    </div>
                    <div class="form-control text-center">
                        <h4>- OR -</h4>
                    </div>
                    <div class="form-control text-center">
                        <input v-model="newSrc" type="text" placeholder="Enter link to mp4 video"/>
                    </div>
                    <div class="form-control text-center">
                        <div class="button button-default" @click="resetOverlay">Cancel</div>
                        <div class="button button-blue" @click="newSrcSelected">Add</div>
                    </div>
                </div>
           </template>
        </overlay>
    </div>
</template>
<script>
    import api from '../routers/api';

    const defaultRange = [0, 10];

    export default {
        props: ['slide'],
        data() {
            return {
                isLoading: false,
                hasVideo: false,
                src: '',
                newSrc: '',
                isSelecting: false,
                range: defaultRange,
                rangeMax: defaultRange[1],
                duration: 0
            }
        },
        created() {
            const videoData = this.slide.data.video;
            if (videoData.source) {
                this.range = [videoData.inPoint, videoData.outPoint];
                this.rangeMax = videoData.duration;
                this.duration = videoData.duration;
                this.src = videoData.source;
                this.hasVideo = true;
            }
        },
        methods: {
            timeFormat(seconds) {
                return Math.floor(seconds / 60) + ':' + (Math.round(100 * (seconds % 60)) / 100);
            },
            sliderDragEnd() {
                this.save();
            },
            save() {
                const inPoint = this.range[0];
                const outPoint = this.range[1];
                this.$nextTick(() => {
                    this.eventHub.$emit('slide-updated', Object.assign(
                        this.slide,
                        { data:
                            Object.assign(this.slide.data, {
                                duration: outPoint - inPoint,
                                video: {
                                    source: this.src,
                                    duration: this.duration,
                                    inPoint: inPoint,
                                    outPoint: outPoint
                                }
                            })
                        }
                    ));
                });
            },
            fileChanged(e) {
                const file = e.target.files[0];
                const formData = new FormData();
                this.isLoading = true;
                this.resetDefaults();
                this.resetOverlay();
                formData.append('file', file, file.name);
                this.$http.post(api.route('slideshows-video-upload'), formData)
                    .then((response) => {
                        this.$refs.fileInput.value = '';
                        this.src = response.body.source;
                    });
            },
            videoLoadedMetadata(video) {
                if (!this.duration) {
                    this.duration = Math.round(video.duration * 10) / 10;
                    this.rangeMax = this.duration;
                    this.range = [0, this.duration];
                    this.save();
                }
                this.isLoading = false;
                this.hasVideo = true;
            },
            videoError() {
                if (this.src) {
                    alert('Error loading video');
                    this.resetDefaults();
                    this.isLoading = false;
                }
            },
            toggleVideo(video) {
                video.currentTime = this.range[0];
                if (video.paused) {
                    video.play();
                    return;
                }
                video.pause();
            },
            checkVideoTime(video) {
                if(video.currentTime >= this.range[1]) {
                    video.pause();
                }
            },
            openVideoOverlay() {
                this.isSelecting = true;
            },
            newSrcSelected() {
                const match = this.newSrc.match(/.*\.mp4/);
                if (!match) {
                    alert('Please enter a link for mp4 video');
                    return;
                }
                this.isLoading = true;
                this.resetDefaults();
                this.$nextTick(() => {
                    this.src = match[0];
                    this.resetOverlay();
                });
            },
            resetDefaults() {
                this.hasVideo = false;
                this.src = '';
                this.duration = 0;
                this.range = defaultRange;
                this.rangeMax = defaultRange[1];
            },
            resetOverlay() {
                this.isSelecting = false;
                this.newSrc = '';
            }
        }
    }
</script>
