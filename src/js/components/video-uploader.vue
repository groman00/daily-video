<style scoped></style>
<template>
    <div class="video-uploader">
        <video class="video" ref="video" :src="src" style="width:100%;" @loadedmetadata="videoLoadedMetadata" @click="toggleVideo"></video>
        <label>Start Time: {{ inPoint }}</label>
        <label>End Time: {{ outPoint }}</label>
        <vue-slider v-model="range" :interval=".1" :min="0" :max="rangeMax" @callback="sliderCallback" @drag-end="sliderDragEnd"></vue-slider>
        <!-- <input ref="fileInput" type="file" accept="video/*" @change="fileChanged"> -->
        <input ref="fileInput" type="file" accept="video/mp4" @change="fileChanged">
    </div>
</template>
<script>
    import api from '../routers/api';

    export default {
        props: ['slide'],
        data() {
            return {
                src: '',
                range: [0, 10],
                rangeMax: 10,
                inPoint: 0,
                outPoint: 0,
                duration: 0
            }
        },
        created() {},
        watch: {
            range(value) {
                //console.log('range', value);
                this.inPoint = this.prettyTime(value[0]);
                this.outPoint = this.prettyTime(value[1]);
            }
        },
        methods: {
            prettyTime(seconds) {
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
                formData.append('file', file, file.name);
                this.$http.post(api.route('slideshows-video-upload'), formData)
                    .then((response) => {
                        console.log(response)
                        this.src = response.body.source;
                    });
            },
            videoLoadedMetadata() {
                this.duration = Math.round( this.$refs.video.duration * 10) / 10;
                this.rangeMax = this.duration;
                this.range = [0, this.duration];
                this.save();
            },
            toggleVideo() {
                //
            }
        }
    }
</script>
