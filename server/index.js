let express = require('express');
let mongoose = require('mongoose');
let uuidv4 = require('uuid/v4');

let accountSchema = mongoose.Schema({
  _id: String,
  balance: Number,
  ledger: [{type: String, amount: Number, date: Date}]
});
let Account = mongoose.model('Account', accountSchema);

function createAccount(req, res) {
  let account = new Account({_id: uuidv4(), balance: 0, ledger: []});
  account.save((err, account) => {if (err) console.log(err)});
  res.send(account);
  console.log('Created account: ' + account._id);
}

function getAccount(req, res) {
  Account.findOne({_id: req.params.id}, (err, account) => {
    if (err) console.log(err);
    res.send(account);
  });
}

function deposit(req, res) {
  return;
}

function withdraw(req, res) {
  return;
}

function main() {
  // Connect to mongo
  mongoose.connect('mongodb://mongo/4dbank', {useMongoClient: true});
  mongoose.Promise = global.Promise;

  // Initialize app
  let app = express();

  // Set routes
  app.post('/api/account', (req, res) => createAccount(req, res));
  app.get('/api/account/:id', (req, res) => getAccount(req, res));
  app.post('/api/account/:id/balance', (req, res) => updateBalance(req, res));

  // Set static file server route
  app.use('/', express.static('../client/dist'))

  // Start server
  app.listen(8888, ()=> console.log('Server started on port 8888'));
}

main();
