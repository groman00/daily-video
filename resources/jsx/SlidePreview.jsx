#include "../js/json2.js"
var preview;
var project;
var __dirname = system.callSystem("pwd").split('resources/jsx')[0];
var DIR = {
    resources: __dirname + 'resources/',
    temp: __dirname + 'temp/',
    exports: __dirname + 'public/exports/'
};

function Preview() {
    var jobs = this.getJSON(DIR.resources + 'json/jobs.json');
    var timestamp = jobs.activeJobs.pop();
    var slide = this.getJSON(DIR.temp + timestamp + '/json/config.json');

    if (!slide) {
        // Config JSON not found, exit job.
        this.closeProject();
    }
    // Clone Project in temp folder
    project.save(new File(DIR.temp + timestamp + '/aep/DailyVideo.aep'));

    this.prefabFolder = this.getFolderByName('Prefabs');



    var comp, slide, image, title, caption, templateName, characters, i;

    templateName = slide.template.name;
    characters = slide.template.characters;
    comp = this.findCompByName(this.prefabFolder, templateName)

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
        comp.layer(2).replaceSource(image, true); // Set image source
    }

    if (/^joke$|quote|date/.test(templateName)) {
        title = slide.title.substr(0, characters.title);
        if (templateName === 'quote') {
            title = '- ' + title;
        }
        comp.layer(2).sourceText.setValue(title); // Set text layer sourceText
    }

    renderQueue = project.renderQueue;
    renderQueueItem = renderQueue.items.add(comp);
    renderQueueItem.setSettings({
        'Quality': 'Draft',
        'Resolution': 'Third'
    });
    renderQueueItem.outputModule(1).setSettings({
        'Output File Info': {
            //'Full Flat Path': DIR.exports + 'preview_' + slide.id
            'Full Flat Path': DIR.exports + 'preview_' + slide.id + timestamp
        }
    });
    renderQueue.queueInAME(true);
    // project.close(CloseOptions.SAVE_CHANGES);

}

Preview.prototype = {
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

};

app.saveProjectOnCrash = false;

// Open project model and kick off automation
app.open(new File(DIR.resources + "aep/DailyVideo.aep"));
project = app.project;
preview = new Preview();
