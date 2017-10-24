export class Account {
  constructor(
    public _id: string,
    public balance: number,
    public interest_rate: number,
    public created_date: number,
    public current_date: string,
    public transactions: Transaction[]) {
  }
}

export class Transaction {
  constructor(
    public t_type: string,
    public t_amount: number,
    public balance: number,
    public date: string) {}
}
