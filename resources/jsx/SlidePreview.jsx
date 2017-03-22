#include "../js/json2.js"
#include "../js/utils.js"

var project;
var DIR;

function Preview(id) {
    var config, slide, comp;

    try {

        DIR.temp = DIR.temp + id;
        config = UTILS.getJSON(DIR.temp + '/json/config.json');

        if (!config) {
            // Config JSON not found, exit job.
            project.close(CloseOptions.DO_NOT_SAVE_CHANGES);
        }
        // Clone Project in temp folder
        project.save(new File(DIR.temp + '/aep/DailyVideo.aep'));

        // Assign references for top level items and folders
        this.itemCollection = project.items;
        this.prefabFolder = UTILS.getFolderByName('Prefabs');
        this.videoFolder = this.itemCollection.addFolder('Video_' + id);

        slide = config.slide;
        comp = UTILS.buildCompFromTemplate(this.videoFolder, slide, 0);
        comp.parentFolder = this.videoFolder;

        renderQueue = project.renderQueue;
        renderQueueItem = renderQueue.items.add(comp);
        renderQueueItem.setSettings({
            'Quality': 'Draft',
            'Resolution': 'Third'
        });
        renderQueueItem.outputModule(1).setSettings({
            'Output File Info': {
                //'Full Flat Path': DIR.exports + 'preview_' + slide.id + timestamp
                'Full Flat Path': DIR.exports + 'preview_' + id
            }
        });
        renderQueue.queueInAME(true);

        app.setTimeout(function () {
            project.close(CloseOptions.SAVE_CHANGES);
        }, 500);

    } catch(e) {
        project.close(CloseOptions.SAVE_CHANGES);
    }
}

function main(jobId, dir) {
    var preview;
    DIR = {
        resources: dir + '/resources/',
        temp: dir + '/temp/',
        exports: dir + '/public/exports/',
        fixtures: dir + '/public/fixtures/'
    };
    app.saveProjectOnCrash = false;
    app.onError = function (errString) {};
    app.open(new File(DIR.resources + "aep/DailyVideo.aep"));
    project = app.project;
    preview = new Preview(jobId);
}
