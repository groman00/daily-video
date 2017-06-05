#include "../js/json2.js"
#include "../js/utils.js"
#include "../js/Renderer.js"

var project;
var DIR;

function Preview(id) {
    var config, slide, comp, renderer;

    try {
        DIR.temp = DIR.temp + id;
        config = UTILS.getJSON(DIR.temp + '/json/config.json');

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

        // Assign references for top level items and folders
        this.itemCollection = project.items;
        this.videoFolder = this.itemCollection.addFolder('Video_' + id);

        slide = config.slide;
        renderer = new Renderer({
            video: this.videoFolder,
            comps: UTILS.getFolderByName('Comps'),
            preComps: UTILS.getFolderByName('Precomps')
        }, slide, 'Comp_0', config);
        comp = renderer.comp;
        comp.parentFolder = this.videoFolder;

        renderQueue = project.renderQueue;
        renderQueueItem = renderQueue.items.add(comp);
        renderQueueItem.setSettings({
            'Quality': 'Draft',
            'Resolution': 'Quarter'
        });
        renderQueueItem.outputModule(1).applyTemplate('Quicktime_H264');
        renderQueueItem.outputModule(1).setSettings({
            'Output File Info': {
                'Base Path': DIR.exports,
                'File Name': 'Preview_' + config._id + '.mov'
            }
        });
        renderQueue.render();
    } catch(e) {
        // alert(e.fileName + ' (Line ' + e.line + '): ' + e.message);
    }
    project.close(CloseOptions.SAVE_CHANGES);
}

function main(jobId, dir) {
    var preview;
    DIR = {
        resources: dir + '/resources/',
        temp: dir + '/temp/',
        exports: dir + '/public/exports/',
        fixtures: dir + '/public/fixtures/'
    };
    preview = new Preview(jobId);
}
