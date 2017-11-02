export interface Account {
  _id: string;
  balance: number;
  interest_rate: number;
  created_date: number;
  current_date: string;
  transactions: Transaction[];
}

export interface Transaction {
  t_type: string;
  t_amount: number;
  balance: number;
  date: string;
}
