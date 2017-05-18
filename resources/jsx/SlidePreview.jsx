#include "../js/json2.js"
#include "../js/Renderer.js"
#include "../js/utils.js"

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
        this.prefabFolder = UTILS.getFolderByName('Prefabs');
        this.videoFolder = this.itemCollection.addFolder('Video_' + id);

        slide = config.slide;
        renderer = new Renderer(this.videoFolder, slide, 'Comp_0');
        comp = renderer.comp;
        comp.parentFolder = this.videoFolder;

        renderQueue = project.renderQueue;
        renderQueueItem = renderQueue.items.add(comp);
        renderQueueItem.setSettings({
            'Quality': 'Draft',
            'Resolution': 'Quarter'
        });
        renderQueueItem.outputModule(1).applyTemplate('Preview_Sequence');
        renderQueueItem.outputModule(1).setSettings({
            'Output File Info': {
                // 'Full Flat Path': DIR.exports + 'preview_' + config._id
                'Base Path': DIR.exports,
                'Subfolder Path': 'preview_' + config._id,
                'File Name': '[#####].jpg'
            }
        });
        renderQueue.render();
    } catch(e) {
        // alert(e);
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
