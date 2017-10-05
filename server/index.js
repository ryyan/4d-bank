let express = require('express');
let mongoose = require('mongoose');
let uuidv4 = require('uuid/v4');

// Create mongo schema
let accountSchema = mongoose.Schema({
  _id: String,
  balance: Number,
  createdDate: {
    type: Date,
    default: Date.now
  },
  currentDate: {
    type: Date,
    default: Date.now
  },
  transactions: [{
    t_type: String, // "type" is a mongoose keyword, hence "t_type"
    t_amount: Number,
    balance: Number,
    date: {
      type: Date,
      default: Date.now
    }
  }]
});

// Add time-to-live index
accountSchema.index({
  'createdAt': 1
}, {
  expireAfterSeconds: 600
});

// Create mongo model
let Account = mongoose.model('Account', accountSchema);

async function createAccountHandler(req, res) {
  try {
    res.send(await createAccount());
  } catch (err) {
    res.status(500).send(err);
  }
}

function createAccount() {
  return new Promise((resolve, reject) => {
    const account = new Account({
      _id: uuidv4(),
      balance: 0
    });

    account.save((err, result) => {
      if (err) {
        console.error(err);
        return reject('Error creating account');
      }
      console.log('Created account: ' + result._id);
      resolve(result);
    });
  });
}

async function getAccountHandler(req, res) {
  try {
    res.send(await getAccount(req.params.id));
  } catch (err) {
    res.status(500).send(err);
  }
}

function getAccount(id) {
  return new Promise((resolve, reject) => {
    console.log('Get account: ' + id);

    if (isUuid(id) == false) {
      return reject("ID must be UUID");
    }

    Account.findOne({
      _id: id
    }, (err, result) => {
      if (err) {
        console.error(err);
        return reject('Error getting account');
      }
      if (result == null) {
        return reject('Account does not exist');
      }
      resolve(result);
    });
  });
}

async function updateBalanceHandler(req, res) {
  try {
    const account = await getAccount(req.params.id);
    res.send(await updateBalance(account, req.query.type, parseFloat(req.query.amount)));
  } catch (err) {
    res.status(500).send(err);
  }
}

function updateBalance(account, transaction_type, transaction_amount) {
  return new Promise((resolve, reject) => {
    console.log('Updating balance: account=%s, type=%s, amount=%d', account, transaction_type, transaction_amount);

    // Validate arguments
    if (account == null) {
      return reject('Account not found');
    }
    if (isNaN(transaction_amount) || transaction_amount <= 0) {
      return reject('Transaction amount must be a number greater than 0');
    }

    // Calculate new account balance
    let new_balance = 0;
    switch (transaction_type) {
      case 'd': // Deposit
      case 'i': // Interest
        new_balance = account.balance + transaction_amount;
        break;
      case 'w': // Withdraw
        if (account.balance - transaction_amount < 0) {
          return reject('Not enough funds');
        }
        new_balance = account.balance - transaction_amount;
        break;
      default:
        return reject('Invalid transaction type');
    }

    // Save changes
    Account.findByIdAndUpdate(account._id, {
      $set: {
        balance: new_balance,
        currentDate: Date.now()
      },
      $push: {
        transactions: {
          t_type: transaction_type,
          t_amount: transaction_amount,
          balance: new_balance,
          date: account.currentDate
        }
      }
    }, {
      safe: true, // Confirm data is written before returning
      new: true // Returns the updated row
    }, (err, result) => {
      if (err) {
        console.error(err);
        return reject('Error updating account');
      }
      if (result == null) {
        return reject('Account does not exist');
      }
      resolve(result);
    });
  });
}

function isUuid(str) {
  return str.match("[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}");
}

function isDate(date) {
  return date instanceof Date && !isNaN(date.valueOf());
}

function main() {
  // Connect to mongo
  mongoose.connect('mongodb://mongo/4dbank', {
    useMongoClient: true
  });
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
  app.listen(8888, () => console.log('Server started on port 8888'));
}

main();
