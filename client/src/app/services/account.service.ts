import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { Account, Transaction } from '../models/account';

@Injectable()
export class AccountService {

  private apiUrl = '/api/account/'

  constructor(private http: HttpClient) { }

  createAccount(interest_rate: number): Observable<Account> {
    return this.http.post<Account>(this.apiUrl, '', {
      params: new HttpParams().set('irate', '0.01'),
    });
  }

  getAccount(id: string): Observable<Account> {
    return this.http.get<Account>(this.apiUrl + id);
  }

  updateBalance(id: string, transaction_type: string, transaction_amount: number): Observable<Transaction> {
    return this.http.post<Transaction>(this.apiUrl + id + '/balance', '', {
      params: new HttpParams()
      .set('type', transaction_type)
      .set('amount', transaction_amount.toString()),
    });
  }

  updateTime(id: string, months: number): Observable<Transaction[]> {
    return this.http.post<Transaction[]>(this.apiUrl + id + '/time', '', {
      params: new HttpParams()
      .set('months', months.toString()),
    });
  }
}
