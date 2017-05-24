#include "../js/json2.js"
#include "../js/Renderer.js"
#include "../js/utils.js"

var project;
var DIR;

function DailyVideo(id) {
    var config, renderQueue, renderQueueItem;

    try {
        DIR.temp = DIR.temp + id;
        config = this.config = UTILS.getJSON(DIR.temp + '/json/config.json');

        if (!config) {
            // Config JSON not found, exit job.
            project.close(CloseOptions.DO_NOT_SAVE_CHANGES);
        }

        app.saveProjectOnCrash = false;
        app.onError = function (errString) {};
        app.open(new File(DIR.resources + "aep/MASTER.aep"));
        project = app.project;

        // Clone Project in temp folder
        project.save(new File(DIR.temp + '/aep/DailyVideo.aep'));

        // Round up video duration.  The video will be cut to precise time after slides are assembled
        this.config.videoDuration = Math.ceil(config.videoDuration)

        // Assign references for top level items and folders
        this.itemCollection = project.items;
        this.videoFolder = this.itemCollection.addFolder('Video_' + id);

        // Create master comp and insert into working folder
        this.createMasterComp(id);

        // Create child comps and add to master comp as layers
        this.addChildCompsToMaster(this.generateChildComps());
        // UTILS.applyWatermark(this.masterComp, config.theme, config.videoDuration);
        this.addNarrationTrack();
        this.addAudioTrack();


    } catch(e) {
        alert(e.fileName + ' (Line ' + e.line + '): ' + e.message);
    }

    // project.close(CloseOptions.SAVE_CHANGES);
}

DailyVideo.prototype = {

    /**/
    addNarrationTrack: function () {
        var config = this.config;
        var narrationTrack = project.importFile(new ImportOptions(File(config.narrationTrack)));
        var level = config.narrationTrackLevel;
        narrationTrack.parentFolder = this.videoFolder;
        layer = this.masterComp.layers.add(narrationTrack, this.masterComp.workAreaDuration);
        layer.audioLevels.setValue([level, level]);
    },

    /**/
    addAudioTrack: function () {
        var config = this.config;
        var duration = this.masterComp.workAreaDuration;
        var level = config.audioTrackLevel;
        var audioTrack;
        var layer;
        var audioLevels;

        if (config.audioTrack) {
            audioTrack = project.importFile(new ImportOptions(File(DIR.fixtures + config.audioTrack)));
            audioTrack.parentFolder = this.videoFolder;
            layer = this.masterComp.layers.add(audioTrack, duration);
            layer.audioLevels.setValue([level, level]);
            // Fade out audio track
            audioLevels = layer.audioLevels;
            audioLevels.setValueAtTime(duration - 3, [level, level]);
            audioLevels.setValueAtTime(duration, [-50, -50]);
        }
    },

    /**
     * Create child comps by cloning prefab templates.  Insert into working folder.
     * @return {CompItem[]}
     */
    generateChildComps: function () {
        var config = this.config;
        var slides = config.slides;
        var comps = [];
        var comp;
        var renderer;
        var folders = {
            video: this.videoFolder,
            comps: UTILS.getFolderByName('Comps'),
            preComps: UTILS.getFolderByName('Precomps')
        };

        for(i = 0, max = slides.length; i < max; i++){
        // for(i = 2, max = 3; i < max; i++){
            renderer = new Renderer(folders, slides[i], 'Comp_' + i, config);
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
        var slideData, layer, i, duration;

        for(i = 0, max = comps.length; i < max; i++){
            slideData = slides[i].data
            duration = parseFloat(slideData.duration) || UTILS.framesToSeconds(slideData.slideTemplate.frames);
            layer = this.masterComp.layers.add(comps[i], duration);
            layer.moveToEnd();
            layer.startTime = currentPosition;
            // currentPosition = currentPosition + (duration - UTILS.framesToSeconds(frames.out));
            currentPosition = currentPosition + duration;
        }
        this.masterComp.workAreaDuration = currentPosition;
    },

    /**
     * Create a master comp and adjust comp size to selected format
     * @param  {Number} id project id
     */
    createMasterComp: function (id) {
        var dimensions = [1920, 1080];
        if (this.config.format === 'square') {
            dimensions[0] = 1080;
        }
        this.masterComp = project.items.addComp('Master_' + id, dimensions[1], dimensions[0], 1.0, this.config.videoDuration, fps);
        this.masterComp.parentFolder = this.videoFolder;
    }
};

function main(id, dir) {
    var video;
    DIR = {
        resources: dir + '/resources/',
        temp: dir + '/temp/',
        exports: dir + '/public/exports/',
        fixtures: dir + '/public/fixtures/'
    };
    video = new DailyVideo(id);
}
