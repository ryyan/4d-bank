import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class AccountService {

  private accountUrl = 'localhost:8888/api/account';

  constructor(private http: Http) { }

  createAccount(): Promise<Account> {
    return this.http.post('${this.accountUrl}', '')
              .toPromise()
              .then(response => response.json() as Account)
              .catch(this.handleError);
  }

  getAccount(id: string): Promise<Account> {
    return this.http.get('${this.accountUrl}/${id}')
              .toPromise()
              .then(response => response.json() as Account)
              .catch(this.handleError);
  }

  updateBalance(id: string, transaction_type: string, transaction_value: number): Promise<Account> {
    return this.http.post('${this.accountUrl}/${id}/balance?type=${transaction_type}&amount=${transaction_amount}', '')
              .toPromise()
              .then(response => response.json() as Account)
              .catch(this.handleError);
  }

  updateTime(id: string, months: number): Promise<Account> {
    return this.http.post('${this.accountUrl}/${id}/time?months=${months}', '')
              .toPromise()
              .then(response => response.json() as Account)
              .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    return Promise.reject(error.message || error);
  }
}

export class Account {
  id: string;
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
