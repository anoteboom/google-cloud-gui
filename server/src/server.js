const path = require('path');
const { readFileSync } = require('fs');
const server = require('server');
const { argv } = require('yargs');
const open = require('open');

const { send } = server.reply;

const port = argv.port || 8000;

const index = (() => {
  return readFileSync(path.join(__dirname, 'public', 'index.html'), {
    encoding: 'UTF-8'
  });
})();

server(
  {
    port,
    security: false,
    public: path.join(__dirname, 'public')
  },
  require('./projects'),
  require('./datastore'),
  () => send(index)
);

if (!argv.skipBrowser) {
  open(`http://localhost:${port}`);
}
