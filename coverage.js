'use strict';

const Express = require('express');
const App = Express();
App.use(Express.static(__dirname + '/coverage/lcov-report'));
App.listen(8080);
console.log('Server listening on port 8080.');
console.log('For coverage go to /index.html');