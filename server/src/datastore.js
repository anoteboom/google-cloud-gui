const { Datastore } = require('@google-cloud/datastore');
const { keyToKeyProto } = require('@google-cloud/datastore/build/src/entity');
const { projects } = require('./db');

const datastoreList = {};

const getDatastore = (id, namespaceParam) => {
  const namespace = !namespaceParam || namespaceParam === '[default]' ? null : namespaceParam;

  let namespaces = datastoreList[id];
  if (!namespaces) {
    namespaces = {};
    datastoreList[id] = namespaces;
  }

  let datastore = namespaces[namespace];
  if (!datastore) {
    const project = projects.getById(id).value();
    datastore = new Datastore({ projectId: project.projectId, namespace: namespace || undefined, apiEndpoint: project.apiEndpoint || undefined });
    namespaces[namespace] = datastore;
  }

  return datastore;
};

const getNamespaceList = (req, res) => {
  const { id } = req.params;

  const datastore = getDatastore(id);
  const query = datastore.createQuery('__namespace__').select('__key__');
  datastore.runQuery(query)
    .then(results => {
      const namespaces = results[0].map(entity => entity[datastore.KEY].name);
      res.json(namespaces);
    })
    .catch(e => {
      console.error('Failed to get namespace list');
      console.warn(e.message);
      res.status(500);
    });
};

const getKindList = () => async (req, res) => {
  const { id, namespace } = req.params;

  const datastore = getDatastore(id, namespace);
  const query = datastore.createQuery('__kind__').select('__key__');
  datastore.runQuery(query)
    .then(results => {
      const kinds = results[0].map(entity => entity[datastore.KEY].name);
      return res.json(kinds);
    })
    .catch(e => {
      console.error('Failed to get kind list');
      console.warn(e.message);
      res.status(500);
    });
};

const queryKind = (req, res) => {
  const { id, namespace, kind } = req.params;
  const { cursor } = req.query;

  const datastore = getDatastore(id, namespace);
  const query = datastore.createQuery(kind).limit(100);
  if (cursor) {
    query.start(cursor);
  }

  datastore.runQuery(query)
    .then(results => {
      results[0].forEach(entity => entity.__key__ = keyToKeyProto(entity[datastore.KEY]));
      return res.json({
        entities: results[0],
        next: results[1],
      });
    })
    .catch(e => {
      console.error('Failed to query kind');
      console.warn(e.message);
      res.status(500);
    });
};

const deleteKindItem = (req, res) => {
  const { id, namespace } = req.params;

  const datastore = getDatastore(id, namespace);
  const keys = req.body.map(({ path }) => (
    datastore.key(
      path
        .map(({ kind, id, name }) => [kind, id ? datastore.int(id) : name])
        .reduce((a, b) => [...a, ...b], [])
    )
  ));

  datastore.delete(keys)
    .then(() => res.json({}))
    .catch(e => {
      console.error('Failed to delete kind item');
      console.warn(e.message);
      res.status(500);
    });
};

module.exports = {
  getNamespaceList,
  getKindList,
  queryKind,
  deleteKindItem,
};
