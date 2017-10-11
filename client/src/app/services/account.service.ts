import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { Account, Transaction } from '../models/account';

@Injectable()
export class AccountService {

  private accountUrl = 'localhost:8888/api/account';

  constructor(private http: HttpClient) { }

  createAccount(interest_rate: number): Observable<Account> {
    return this.http.post<Account>('/api/account', '', {
      params: new HttpParams().set('irate', '0.01'),
    });
  }

  getAccount(id: string): Observable<Account> {
    return this.http.get<Account>('/api/account/${id}');
  }

  updateBalance(id: string, transaction_type: string, transaction_amount: number): Observable<Account> {
    return this.http.post<Account>('/api/account/${id}/balance', '', {
      params: new HttpParams().set('type', transaction_type).set('amount', transaction_amount.toString()),
    });
  }

  updateTime(id: string, months: number): Observable<Account> {
    return this.http.post<Account>('/api/account/${id}/time', '', {
      params: new HttpParams().set('months', months.toString()),
    });
  }
}
