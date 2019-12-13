const { projects } = require('./db');

const getProjectList = (req, res) => res.json(projects.value());

const createProject = (req, res) => {
  const { projectId, apiEndpoint } = req.body;
  if (!projectId || projectId === '') {
    return res.status(400);
  }

  return res.json(projects.insert({ service: 'datastore', projectId, apiEndpoint }).write());
};

const deleteProject = (req, res) => {
  projects.removeById(req.params.id).write();
  return res.json({});
};

module.exports = {
  getProjectList,
  createProject,
  deleteProject,
};
