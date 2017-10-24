let express = require('express');
let mongoose = require('mongoose');
let uuidv4 = require('uuid/v4');
let moment = require('moment');
let path = require('path');

// Create mongo schema
let accountSchema = mongoose.Schema({
  _id: String,
  balance: Number,
  interest_rate: {
    type: Number,
    default: 0.01
  },
  created_date: {
    type: Date,
    default: Date.now
  },
  current_date: {
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

// Transaction limit per account
const transaction_limit = 1400;

async function createAccountHandler(req, res) {
  try {
    res.send(await createAccount(parseFloat(req.query.irate)));
  } catch (err) {
    res.status(500).send(err);
  }
}

function createAccount(interest_rate) {
  return new Promise((resolve, reject) => {
    // Validate arguments
    if (isNaN(interest_rate) || interest_rate < 0.001 || interest_rate > 0.1) {
      return reject('Interest rate must be between 0.001 and 0.1');
    }

    const account = new Account({
      _id: uuidv4(),
      balance: 0,
      interest_rate: interest_rate
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
    console.log('Updating balance: account=%s, type=%s, amount=%d', account._id, transaction_type, transaction_amount);

    // Validate arguments
    if (account == null) {
      return reject('Account not found');
    }
    if (isNaN(transaction_amount) || transaction_amount <= 0) {
      return reject('Transaction amount must be a number greater than 0 when depositing or withdrawing');
    }

    // Check transaction limit
    if (account.transactions.length > transaction_limit) {
      return reject('Transaction limit reached');
    }

    // Calculate new account balance
    let new_balance = 0;
    switch (transaction_type) {
      case 'd': // Deposit
        new_balance = account.balance + transaction_amount;
        break;
      case 'w': // Withdraw
        if (account.balance - transaction_amount < 0) {
          return reject('Not enough funds for withdraw');
        }
        new_balance = account.balance - transaction_amount;
        break;
      default:
        return reject('Invalid transaction type');
    }

    // Manually increment account's current_date
    let new_date = moment(account.current_date).add(1, 'minutes').toDate()

    // Save changes
    let new_transaction = {
      t_type: transaction_type,
      t_amount: transaction_amount,
      balance: new_balance,
      date: new_date
    };
    Account.findByIdAndUpdate(account._id, {
      $set: {
        balance: new_balance,
        current_date: new_date
      },
      $push: {
        transactions: new_transaction
      }
    }, {
      safe: true, // Confirm data is written before returning
      new: true // Returns the updated row
    }, (err, result) => {
      if (err) {
        console.error(err);
        return reject('Error updating account');
      }
    });

    // Return the new transaction
    resolve(new_transaction);
  });
}

async function updateTimeHandler(req, res) {
  try {
    const account = await getAccount(req.params.id);
    res.send(await updateTime(account, parseInt(req.query.months)));
  } catch (err) {
    res.status(500).send(err);
  }
}

function updateTime(account, months) {
  return new Promise((resolve, reject) => {
    console.log('Updating time: account=%s, months=%d', account._id, months);

    // Validate arguments
    if (account == null) {
      return reject('Account not found');
    }
    if (isNaN(months) || months <= 0 || months > 120) {
      return reject('Months must be a number between 0 and 121');
    }

    // Check transaction limit
    if (account.transactions.length > transaction_limit) {
      return reject('Transaction limit reached');
    }
    if (account.transactions.length + months > transaction_limit) {
      return reject('Time change results in exceeded transaction limit');
    }

    // Pre-calculate all month increments and interest transactions
    let new_transactions = []
    let new_date = account.current_date
    for (let i = 1; i <= months; i++) {
      // Advance account current_date by a month
      new_date = moment(new_date).add(1, 'months').toDate();
      if (new_transactions.length > 0) {
        let last_transaction = new_transactions[new_transactions.length - 1]
        let new_amount = last_transaction.balance * account.interest_rate;
        new_transactions.push({
          t_type: 'i',
          t_amount: new_amount,
          balance: last_transaction.balance + new_amount,
          date: new_date
        });
      } else {
        // First month
        let new_amount = account.balance * account.interest_rate;
        new_transactions.push({
          t_type: 'i',
          t_amount: new_amount,
          balance: account.balance + new_amount,
          date: new_date
        });
      }
    }

    // Get final transaction to get final balance and date
    let last_transaction = new_transactions[new_transactions.length - 1];

    // Push transactions and update account
    Account.findByIdAndUpdate(account._id, {
      $set: {
        current_date: last_transaction.date,
        balance: last_transaction.balance
      },
      $pushAll: {
        transactions: new_transactions
      }
    }, {
      safe: true, // Confirm data is written before returning
      new: true // Returns the updated row
    }, (err) => {
      if (err) {
        console.error(err)
        return reject('Error updating time');
      }
    });

    // Return the list of new transactions
    resolve(new_transactions);
  });
}

function isUuid(str) {
  return str.match("[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}");
}

function main() {
  // Connect to mongo
  mongoose.connect('mongodb://mongo/4dbank', {
    useMongoClient: true
  });
  mongoose.Promise = global.Promise;

  // Initialize app
  let app = express();

  // Set API routes
  app.post('/api/account', (req, res) => createAccountHandler(req, res));
  app.get('/api/account/:id', (req, res) => getAccountHandler(req, res));
  app.post('/api/account/:id/balance', (req, res) => updateBalanceHandler(req, res));
  app.post('/api/account/:id/time', (req, res) => updateTimeHandler(req, res));

  // Set static file server route
  app.use(express.static(path.join(__dirname, '../client/dist')));

  // Serve index.html on all remaining routes to leave routing up to Angular
  // https://stackoverflow.com/questions/20396900/angularjs-routing-in-expressjs
  app.all('/*', (req, res) => res.sendFile(path.join(__dirname, '../client/dist/index.html')));

  // Start server
  app.listen(8888, () => console.log('Server started on port 8888'));
}

main();
