const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const { argv } = require('yargs');
const { getProjectList, createProject, deleteProject } = require('./projects');
const { getNamespaceList, getKindList, queryKind, deleteKindItem } = require('./datastore');

const port = argv.port || 8000;
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

app.get('/projects', getProjectList);
app.post('/projects', createProject);
app.delete('/projects/:id', deleteProject);

app.get('/datastore/:id/namespaces', getNamespaceList);
app.get('/datastore/:id/:namespace/kinds', getKindList());
app.get('/datastore/:id/:namespace/kinds/:kind/query', queryKind);
app.post('/datastore/:id/:namespace/delete', deleteKindItem);

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(port);

if (!argv.skipBrowser) {
  const open = require('open');
  open(`http://localhost:${port}`);
}
