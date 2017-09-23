let express = require('express');
let mongoose = require('mongoose');

function createAccount(req, res) {
  return;
}

function getAccount(req, res) {
  return;
}

function updateBalance(req, res) {
  return;
}

function main() {
  let app = express();

  // Set routes
  app.route('/api/account')
    .get((req, res) => getAccount())
    .post((req, res) => createAccount())
  app.route('/api/account/balance')
    .post((req, res) => updateBalance())

  // Set static file server route
  app.use('/', express.static('../client/dist'))

  // Start server
  app.listen(5002, ()=> console.log('Server started on port 5002'));
}

main();
