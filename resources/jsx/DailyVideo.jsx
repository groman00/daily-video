/**
 * Save as new file before processing?
 * var myNewFile = new File("~/Desktop/myNewFile.aep");
 * app.project.save(myNewFile);
 *
 * Need a way to handle multiple jobs at one time:
 * Make a jobs json with an array of current job timestamps.  Let this file take the last job timestamp,
 * fetch the timestamped config file and generate a new aep with that time stamp.  That way each job has its
 * own config and project.  Let the node script clean out the temp folder after render starts.
 *
 * -OR-
 *
 * Build some logic to wait for any existing project jobs to finish?
 */

var video;
var project;
var __dirname = '/Library/WebServer/Documents/alpha/daily-video/';
var DIR = {
    projects: __dirname + 'resources/aep/',
    temp: __dirname + 'temp/',
    exports: __dirname + 'public/exports/'
};

function DailyVideo() {
    var config = this.config = this.getJSON('config.json');
    var audio, renderQueue, renderQueueItem;
    if (!this.config) {
        // Config JSON not found, exit job.
        this.closeProject();
    }
    this.itemCollection = project.items;
    this.prefabFolder = project.item(1);
    this.videoFolder = this.itemCollection.addFolder('Video_' + config.timestamp);

    // Create master comp and insert into working folder
    this.masterComp = this.addComp('Master_' + config.timestamp, config.videoDuration);
    this.masterComp.parentFolder = this.videoFolder;

    // Create child comps and add to master comp as layers
    this.addChildCompsToMaster(this.generateChildComps());

    // Add audio and create audio layer in master comp
    audio = project.importFile(new ImportOptions(File(config.audio)));
    audio.parentFolder = this.videoFolder;
    this.masterComp.layers.add(audio, config.videoDuration);

    // Add master comp to render queue
    renderQueue = project.renderQueue;
    renderQueueItem = renderQueue.items.add(this.masterComp);
    renderQueueItem.outputModule(1).setSettings({
        'Output File Info': {
            'Full Flat Path': DIR.exports + 'DailyVideo_' + config.timestamp
        }
    });

    // Listen to render queue events (Not working: https://forums.adobe.com/message/9318251#9318251)
    // renderQueueItem.onStatusChanged = function () {
    //     $.writeln(renderQueueItem.status);
    // };

    // Immediately render comp using Adobe Media Encoder (required for mp4 exports)
    renderQueue.queueInAME(true);

    // Once renderering starts, we don't need the project anymore.
    this.closeProject();
}

DailyVideo.prototype = {

    closeProject: function () {
        // Close project without saving.
        // Adding sleep to prevent app crashes.
        //$.sleep(2000);
        project.close(CloseOptions.DO_NOT_SAVE_CHANGES)
    },

    /**
     * Read json file and parse to object;
     * @param  {String} file
     * @return {Object}
     */
    getJSON: function (file) {
        var file = File(DIR.temp + '/json/' + file);
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
     * Create child comps by cloning prefab templates.  Insert into working folder.
     * @return {CompItem[]}
     */
    generateChildComps: function () {
        var slides = this.config.slides;
        var comps = [];
        var comp, slide, image, i;
        for(i = 0, max = slides.length; i < max; i++){
            slide = slides[i];
            image = project.importFile(new ImportOptions(File(slide.image)));
            image.parentFolder = this.videoFolder;
            comp = this.findCompByName(this.prefabFolder, slide.template).duplicate();
            comp.name = 'Comp_' + i;
            comp.layers.add(image); // Import slide image to layer and add to comp
            comp.layer(2).sourceText.setValue(slide.caption); // Set text layer sourceText
            comp.layer(2).moveToBeginning(); // Bring text layer to front
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
        var duration = this.config.slideDuration;
        var layer, i;
        for(i = 0, max = comps.length; i < max; i++){
            layer = this.masterComp.layers.add(comps[i], duration);
            layer.startTime = duration * i;
        }
    }
};

app.open(new File(DIR.projects + "DailyVideo.aep"));
project = app.project;
video = new DailyVideo();
