/**
 * Need a way to handle multiple jobs at one time:
 * Make a jobs json with an array of current job timestamps.  Let this file take the last job timestamp,
 * fetch the timestamped config file and generate a new aep with that time stamp.  That way each job has its
 * own config and project.  Let the node script clean out the temp folder after render starts.
 *
 * -OR-
 *
 * Build some logic to wait for any existing project jobs to finish?
 */

#include "../js/json2.js"
var video;
var project;
var __dirname = system.callSystem("pwd").split('resources/jsx')[0];
var DIR = {
    resources: __dirname + 'resources/',
    temp: __dirname + 'temp/',
    exports: __dirname + 'public/exports/',
    fixtures: __dirname + 'public/fixtures/'
};
var fps = 30;
var utils = {
    framesToSeconds: function (frames) {
        return ( frames / fps );
    }
}

function DailyVideo() {
    var jobs = this.getJSON(DIR.resources + 'json/jobs.json');
    var timestamp = jobs.activeJobs.pop();
    var config = this.config = this.getJSON(DIR.temp + timestamp + '/json/config.json');
    var narrationTrack, audioTrack, renderQueue, renderQueueItem, timestamp;
    if (!config) {
        // Config JSON not found, exit job.
        this.closeProject();
    }

    // Clone Project in temp folder
    project.save(new File(DIR.temp + timestamp + '/aep/DailyVideo.aep'));

    // Assign references for top level items and folders
    this.itemCollection = project.items;
    // this.prefabFolder = project.item(1);
    this.prefabFolder = this.getFolderByName('Prefabs');
    this.videoFolder = this.itemCollection.addFolder('Video' + timestamp);

    // Create master comp and insert into working folder
    this.masterComp = this.addComp('Master' + timestamp, config.videoDuration);
    this.masterComp.parentFolder = this.videoFolder;

    // Create child comps and add to master comp as layers
    this.addChildCompsToMaster(this.generateChildComps());

    // Add narrationTrack and create narrationTrack layer in master comp
    narrationTrack = project.importFile(new ImportOptions(File(config.narrationTrack)));
    narrationTrack.parentFolder = this.videoFolder;
    this.masterComp.layers.add(narrationTrack, config.videoDuration);

    // Add audioTrack, if configured
    audioTrack = project.importFile(new ImportOptions(File(DIR.fixtures + config.audioTrack)));
    audioTrack.parentFolder = this.videoFolder;
    this.masterComp.layers.add(audioTrack, config.videoDuration);


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

    // Once renderering starts, we don't need the project anymore.
    this.closeProject();
}

DailyVideo.prototype = {

    closeProject: function () {
        // Close project without saving.
        // Adding sleep to prevent app crashes.
        //$.sleep(2000);
        //project.close(CloseOptions.DO_NOT_SAVE_CHANGES);
        project.close(CloseOptions.SAVE_CHANGES);
    },

    /**
     * Read json file and parse to object;
     * @param  {String} path
     * @return {Object}
     */
    getJSON: function (path) {
        var file = File(path);
        var config;
        if (!file) {
            return false;
        }
        file.open('r');
        config = JSON.parse(file.read());
        file.close();
        return config;
    },

    /**
     * Create new comp and add it to top level of the project
     * @param {String} name
     * @param {Number} duration
     * @return {CompItem}
     */
    addComp: function (name, duration) {
        // (name, width, height, pixelAspect, duration, frameRate)
        return project.items.addComp(name, 1920, 1080, 1.0, duration, 29.97);
    },

    /**
     * Find comp within parent by name
     * @param  {FolderItem|CompItem} parent
     * @param  {String} name
     * @return {CompItem}
     */
    findCompByName: function (parent, name) {
        var comp, i;
        for (i = 1; i <= parent.numItems; i ++) {
            if ((parent.item(i) instanceof CompItem) && (parent.item(i).name === name)) {
                comp = parent.item(i);
                break;
            }
        }
        return comp;
    },

    /**
     * Find root folder by name
     * @param  {String} name
     * @return {FolderItem}
     */
    getFolderByName: function (name) {
        var folder, i;
        for (i = 1; i <= project.numItems; i ++) {
            if ((project.item(i) instanceof FolderItem) && (project.item(i).name === name)) {
                folder = project.item(i);
                break;
            }
        }
        return folder;
    },

    /**
     * Create child comps by cloning prefab templates.  Insert into working folder.
     * @return {CompItem[]}
     */
    generateChildComps: function () {
        var slides = this.config.slides;
        var comps = [];
        var comp, slide, image, title, caption, templateName, characters, i;
        for(i = 0, max = slides.length; i < max; i++){
            slide = slides[i];
            templateName = slide.template.name;
            characters = slide.template.characters;
            comp = this.findCompByName(this.prefabFolder, templateName).duplicate();
            comp.name = 'Comp_' + i;

            /**
             * todo
             * Clean up this logic.  Handle quotation authors and quotation marks.  Handle Joke and punchline.
             * Maybe give each slide type it's own render function?
             */
            if (!/bumper|share/.test(templateName)) {
                caption = slide.caption.substr(0, characters.caption);
                if (templateName === 'quote') {
                    caption = '"' + caption + '"';
                }
                comp.layer(1).sourceText.setValue(caption); // Set text layer sourceText
            }

            if (!/bumper|share|quote|joke|title_1|date/.test(templateName)) {
                image = project.importFile(new ImportOptions(File(slide.image)));
                image.parentFolder = this.videoFolder;
                comp.layer(2).replaceSource(image, true); // Set image source
            }

            if (/^joke$|quote|date/.test(templateName)) {
                title = slide.title.substr(0, characters.title);
                if (templateName === 'quote') {
                    title = '- ' + title;
                }
                comp.layer(2).sourceText.setValue(title); // Set text layer sourceText
            }

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
        var layer, i, duration, frames;
        for(i = 0, max = comps.length; i < max; i++){
            frames = slides[i].template.frames;
            duration = utils.framesToSeconds(frames.total);
            layer = this.masterComp.layers.add(comps[i], duration);
            layer.moveToEnd();
            layer.startTime = currentPosition;
            currentPosition = currentPosition + (duration - utils.framesToSeconds(frames.out));
        }
    }
};

// Safeguards to prevent application crashing and error dialog boxes
app.saveProjectOnCrash = false;
app.onError = function (errString) {};

// Open project model and kick off automation
app.open(new File(DIR.resources + "aep/DailyVideo.aep"));
project = app.project;
video = new DailyVideo();
