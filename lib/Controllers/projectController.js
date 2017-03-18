const Project = require('../Models/Project');

class ProjectController {
  constructor() {}
  saveProject(req, res, next) {
    // console.log(req, res, next);
    let project = new Project({
      name: 'my new project'
    });
    project.save(function (err) {
      if (err) {
        res.end('error saving project');
      }
      res.end('project saved')
    })
  }
}

module.exports = new ProjectController();
