<style scoped></style>
<template>
    <div class="video-uploader">
        <div v-show="hasVideo" class="form-control">
            <span class="video-helper-text text-center">( click video to play )</span>
            <video class="video" ref="video" :src="src" style="width:100%;" @loadedmetadata="videoLoadedMetadata($event.target)" @click="toggleVideo($event.target)" @timeupdate="checkVideoTime($event.target)"></video>
        </div>
        <div v-show="isLoading" class="form-control">
            <div class="video-placeholder">
                <loading-indicator></loading-indicator>
            </div>
        </div>
        <div v-show="hasVideo" class="form-control">
            <vue-slider v-model="range" :interval=".1" :min="0" :max="rangeMax" :formatter="timeFormat" @callback="sliderCallback" @drag-end="sliderDragEnd"></vue-slider>
        </div>
        <div class="form-control text-center">
            <label class="button button-blue button-input" :disabled="isLoading">
                <!-- <input ref="fileInput" type="file" accept="video/*" @change="fileChanged"> -->
                <input ref="fileInput" :disabled="isLoading" type="file" accept="video/mp4" @change="fileChanged">
                {{ isLoading ? 'Uploading...' : 'Upload Video' }}
            </label>
        </div>
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
                return Math.floor(seconds / 60) + ':' + (seconds % 60);
            },
            sliderDragEnd() {
                this.save();
            },
            save() {
                this.$nextTick(() => {
                    this.eventHub.$emit('slide-updated', Object.assign(
                        this.slide,
                        Object.assign(this.slide.data, {
                            video: {
                                source: this.src,
                                duration: this.duration,
                                inPoint: this.range[0],
                                outPoint: this.range[1]
                            }
                        })
                    ));
                });
            },
            fileChanged(e) {
                const file = e.target.files[0];
                const formData = new FormData();
                this.hasVideo = false;
                this.isLoading = true;

                // reset any existing values;
                this.src = '';
                this.duration = 0;
                this.range = defaultRange;
                this.rangeMax = defaultRange[1];
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
            }
        }
    }
</script>
