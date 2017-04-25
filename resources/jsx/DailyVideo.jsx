#include "../js/json2.js"
#include "../js/Renderer.js"
#include "../js/utils.js"

var project;
var DIR;

function DailyVideo(id) {
    var config, narrationTrack, audioTrack, renderQueue, renderQueueItem;

    try {
        DIR.temp = DIR.temp + id;
        config = this.config = UTILS.getJSON(DIR.temp + '/json/config.json');

        if (!config) {
            // Config JSON not found, exit job.
            project.close(CloseOptions.DO_NOT_SAVE_CHANGES);
        }

        app.saveProjectOnCrash = false;
        app.onError = function (errString) {};
        app.open(new File(DIR.resources + "aep/" + config.theme + ".aep"));
        project = app.project;

        // Clone Project in temp folder
        project.save(new File(DIR.temp + '/aep/DailyVideo.aep'));

        // Assign references for top level items and folders
        this.itemCollection = project.items;
        this.prefabFolder = UTILS.getFolderByName('Prefabs');
        this.videoFolder = this.itemCollection.addFolder('Video_' + id);

        // Create master comp and insert into working folder
        this.masterComp = UTILS.addComp(project, 'Master_' + id, config.videoDuration);
        this.masterComp.parentFolder = this.videoFolder;

        // Create child comps and add to master comp as layers
        this.addChildCompsToMaster(this.generateChildComps());

        // Add narrationTrack and create narrationTrack layer in master comp
        narrationTrack = project.importFile(new ImportOptions(File(config.narrationTrack)));
        narrationTrack.parentFolder = this.videoFolder;
        this.masterComp.layers.add(narrationTrack, config.videoDuration);
        this.masterComp.layer(1).audioLevels.setValue([config.narrationTrackLevel, config.narrationTrackLevel]);

        // Add audioTrack, if configured
        if (config.audioTrack) {
            audioTrack = project.importFile(new ImportOptions(File(DIR.fixtures + config.audioTrack)));
            audioTrack.parentFolder = this.videoFolder;
            this.masterComp.layers.add(audioTrack, config.videoDuration);
            this.masterComp.layer(1).audioLevels.setValue([config.audioTrackLevel, config.audioTrackLevel]);
        }

        /**
         *
         * Should the master comp be moved to the project root so we can utilize watch folders in aerender?
         *
         */

        /*
        // Add master comp to render queue
        renderQueue = project.renderQueue;
        renderQueueItem = renderQueue.items.add(this.masterComp);
        renderQueueItem.outputModule(1).setSettings({
            'Output File Info': {
                'Full Flat Path': DIR.exports + 'DailyVideo' + timestamp
            }
        });

        // Listen to render queue events (Not working: https://forums.adobe.com/message/9318251#9318251)
        renderQueueItem.onStatusChanged = function () {
            $.writeln(renderQueueItem.status);
        };

        renderQueue.render();
        */


        // Immediately render comp using Adobe Media Encoder (required for mp4 exports)
        // renderQueue.queueInAME(true);

    } catch(e) {}

    project.close(CloseOptions.SAVE_CHANGES);
}

DailyVideo.prototype = {

    /**
     * Create child comps by cloning prefab templates.  Insert into working folder.
     * @return {CompItem[]}
     */
    generateChildComps: function () {
        var slides = this.config.slides;
        var comps = [];
        var comp;
        var renderer;
        for(i = 0, max = slides.length; i < max; i++){
            renderer = new Renderer(this.videoFolder, slides[i], 'Comp_' + i);
            comp = renderer.comp;
            comp.parentFolder = this.videoFolder;
            comps.push(comp);
        }
        return comps;
    },

    /**
     * Create layers in master comp, using child comps.  Sequence child comps one after another.
     * @param {[type]} comps [description]
     */
    addChildCompsToMaster: function (comps) {
        var slides = this.config.slides;
        var currentPosition = 0;
        var slideData, layer, i, duration, frames;
        for(i = 0, max = comps.length; i < max; i++){
            slideData = slides[i].data
            frames = slideData.slideTemplate.frames;
            duration = slideData.duration || UTILS.framesToSeconds(frames.total);
            layer = this.masterComp.layers.add(comps[i], duration);
            layer.moveToEnd();
            layer.startTime = currentPosition;
            currentPosition = currentPosition + (duration - UTILS.framesToSeconds(frames.out));
        }
    }
};

function main(jobId, dir) {
    var video;
    DIR = {
        resources: dir + '/resources/',
        temp: dir + '/temp/',
        exports: dir + '/public/exports/',
        fixtures: dir + '/public/fixtures/'
    };
    video = new DailyVideo(jobId);
}
