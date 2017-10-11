export class Account {
  _id: string;
  balance: number;
  interest_rate: number;
  created_date: string;
  current_date: string;
  transactions: Array<Transaction>;
}

export class Transaction {
  t_type: string;
  t_amount: number;
  balance: number;
  date: string;
}
