const { Datastore } = require('@google-cloud/datastore');
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
  const query = datastore.createQuery(undefined, kind).limit(100);
  if (cursor) {
    query.start(cursor);
  }

  datastore.runQuery(query)
    .then(results => {
      results[0].forEach(entity => {
        entity.__key__ = keyFromKeyProto(entity[datastore.KEY]);
        delete entity[datastore.KEY];
      });
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

function keyFromKeyProto(key) {
  return {
    namespace: key.namespace,
    kind: key.kind,
    id: key.id,
  };
}

const updateKindItem = (req, res) => {
  const { datastoreId, namespace, kind, id } = req.params;

  const datastore = getDatastore(datastoreId, namespace);

  const entity = {
    key: datastore.key({ path: [kind, parseInt(id, 10)] }),
    method: 'update',
    data: toDatastore(req.body),
  };


  datastore.save(entity)
    .then(() => res.json({}))
    .catch(e => {
      console.error('Failed to save kind item');
      console.warn(e.message);
      res.status(500);
    });
};

const toDatastore = (obj, nonIndexed) => {
  nonIndexed = nonIndexed || [];
  const results = [];

  Object.keys(obj).forEach(keyName => {
    if (obj[keyName] === undefined) {
      return;
    }

    let value = obj[keyName];
    if (typeof (obj[keyName]) === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(obj[keyName])) {
      // Timestamp
      value = new Date(obj[keyName]);
    }
    // TODO What about types other than Timestamp ?

    results.push({ name: keyName, value, excludeFromIndexes: nonIndexed.indexOf(keyName) !== -1 });
  });
  return results;
};

const deleteKindItem = (req, res) => {
  const { id, namespace } = req.params;

  const datastore = getDatastore(id, namespace);
  const keys = req.body.map(({ kind, id }) => datastore.key({ namespace: undefined, path: [kind, datastore.int(id)] }));

  datastore.delete(keys, { errorOnMissing: true })
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
  updateKindItem,
  deleteKindItem,
};
