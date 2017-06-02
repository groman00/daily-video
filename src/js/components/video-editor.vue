<style scoped></style>
<template>
    <div class="video-editor">
        <!-- <div > -->


            <draggable v-model="slides" class="grid grid-small" :options="{ handle: '.drag-handle' }" @end="dragEnd">
                <div class="cell-m-4" v-for="(slide, index) in slides" :key="slide.id">
                    <video-editor-item :slideshowId="slideshowId" :slide="slide" :slideTypes="config.slideTypes" :effects="config.effects" :transitions="config.transitions" :textAlignments="config.textAlignments" :format="format" :slideIndex="index" :slideCount="slides.length" :theme="theme" :bumpers="getBumpers" @durationUpdated="durationUpdated"></video-editor-item>
                </div>
            </draggable>


            <!-- <div class="cell-m-4" v-for="(slide, index) in slides" :key="slide.id">
                <video-editor-item :slideshowId="slideshowId" :slide="slide" :slideTypes="config.slideTypes" :effects="config.effects" :transitions="config.transitions" :textAlignments="config.textAlignments" :format="format" :slideIndex="index" :slideCount="slides.length" :theme="theme" :bumpers="getBumpers" @durationUpdated="durationUpdated"></video-editor-item>
            </div>
            <slide-new :slideshowId="slideshowId"></slide-new> -->
        <!-- </div> -->
    </div>
</template>
<script>
    import api from '../routers/api';
    import { framesToSeconds, fillIndexedArray } from '../lib/helpers';

    export default {
        props: ['slideshowId', 'slides', 'config', 'theme', 'format'],
        computed: {
            /**
             * Return an array of indexes that represents the number of bumpers for this theme
             */
            getBumpers() {
                if (!this.theme) {
                    return [];
                }
                return fillIndexedArray(this.config.themes[this.theme].bumpers);
            }
        },
        watch: {
            slides() {
                this.$nextTick(() => {
                    this.durationUpdated();
                })
            }
        },
        methods: {
            durationUpdated() {
                const slides = this.slides;
                let customDuration;
                let data;
                this.$emit('durationUpdated', slides.reduce(function (acc, slide) {
                    data = slide.data;
                    customDuration = data.duration;
                    if (data.slideType === 'video' && data.video.duration) {
                        customDuration = data.video.outPoint - data.video.inPoint;
                    }
                    return acc + parseFloat(customDuration || framesToSeconds(data.slideTemplate.frames));
                }, 0));
            },
            dragEnd(e) {
                const oldIndex = e.oldIndex;
                const newIndex = e.newIndex;
                const slide = this.slides[newIndex];
                if (oldIndex === newIndex) {
                    return;
                }
                this.$http.post(api.route('slideshows-move-slide'), {
                    slideshowId: this.slideshowId,
                    slideId: slide.id,
                    index: (newIndex + 1) // index is 1 based, not 0
                });
            }
        }
    }
</script>
