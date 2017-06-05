'use strict';

const Express = require('express');
const portfinder = require('portfinder');
const App = Express();
App.use(Express.static(__dirname + '/coverage/lcov-report'));
portfinder.getPortPromise().then((port) => {
  App.listen(port);
  console.log('Server listening on port ' + port + '.');
  console.log('For coverage go to /index.html:' + port);
}).catch((err) => {
  console.log(err);
});