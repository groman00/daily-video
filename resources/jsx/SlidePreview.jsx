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
        }, slide, 'Comp_0', config.theme);
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
            'Crop': true,
            'Crop Top': 0,
            'Crop Right': 0,
            'Crop Bottom': 105, // AfterFX has a bug that swaps the bottom value with the right value...
            'Crop Left': 105,
            'Output File Info': {
                // 'Full Flat Path': DIR.exports + 'preview_' + config._id
                'Base Path': DIR.exports,
                'Subfolder Path': 'preview_' + config._id,
                'File Name': '[#####].jpg'
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
