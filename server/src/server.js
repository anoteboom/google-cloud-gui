const path = require('path');
const { readFileSync } = require('fs');
const server = require('server');
const { argv } = require('yargs');
const open = require('open');

const { error } = server.router;
const { send, status } = server.reply;

const port = argv.port || 8000;
const serverConfig = {
  port,
  security: false,
  public: path.join(__dirname, 'public')
};

server(
  serverConfig,
  require('./projects'),
  require('./datastore'),
  () => send((() => readFileSync(path.join(__dirname, 'public', 'index.html'), { encoding: 'UTF-8' }))()),
  error(ctx => status(500).send(ctx.error.message))
);

if (!argv.skipBrowser) {
  open(`http://localhost:${port}`);
}
