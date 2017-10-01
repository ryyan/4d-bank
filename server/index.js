let express = require('express');
let mongoose = require('mongoose');
let uuidv4 = require('uuid/v4');

// Create mongo schema and model
let accountSchema = mongoose.Schema({
  _id: String,
  balance: Number,
  ledger: [{type: String, amount: Number, date: Date}]
});
let Account = mongoose.model('Account', accountSchema);

function createAccountHandler(req, res) {
  let account = new Account({_id: uuidv4(), balance: 0, ledger: []});
  account.save((err, account) => {if (err) console.log(err)});
  res.send(account);
  console.log('Created account: ' + account._id);
}

function getAccountHandler(req, res) {
  getAccount(req.params.id).then((account) => res.send(account))
    .catch((err) => console.log(err))
}

function getAccount(id) {
  Account.findOne({_id: id}, (err, account) => {
    return new Promise((resolve, reject) => {
      if (err) reject(err);
      resolve(account);
    });
  });
}

function updateBalanceHandler(req, res) {
  return;
}

function main() {
  // Connect to mongo
  mongoose.connect('mongodb://mongo/4dbank', {useMongoClient: true});
  mongoose.Promise = global.Promise;

  // Initialize app
  let app = express();

  // Set routes
  app.post('/api/account', (req, res) => createAccountHandler(req, res));
  app.get('/api/account/:id', (req, res) => getAccountHandler(req, res));
  app.post('/api/account/:id/balance', (req, res) => updateBalanceHandler(req, res));

  // Set static file server route
  app.use('/', express.static('../client/dist'))

  // Start server
  app.listen(8888, ()=> console.log('Server started on port 8888'));
}

main();
