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

async function createAccountHandler(req, res) {
  try {
    res.send(await createAccount());
  } catch(err) {
    res.status(500).send(err);
  }
}

function createAccount() {
  return new Promise((resolve, reject) => {
    const account = new Account({_id: uuidv4(), balance: 0, ledger: []});

    account.save((err, result) => {
      if (err) {
        console.error(err);
        reject('Error creating account');
      }
      console.log('Created account: ' + result._id);
      resolve(result);
    });
  });
}

async function getAccountHandler(req, res) {
  try{
    res.send(await getAccount(req.params.id));
  } catch(err) {
    res.status(500).send(err);
  }
}

function getAccount(id) {
  return new Promise((resolve, reject) => {
    if (isUuid(id) == false) reject("ID must be UUID");

    Account.findOne({_id: id}, (err, result) => {
      if (err) {
        console.error(err);
        reject('Error getting account');
      }
      resolve(result);
    });
  });
}

async function updateBalanceHandler(req, res) {
  let account = await getAccount(req.params.id);
  res.send(await updateBalance(account._id, account.balance, req.query.type, req.query.amount));
}

function updateBalance(account_id, account_balance, transaction_type, transaction_amount) {
  return;
}

function isUuid(s) {
  return s.match("[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}");
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
