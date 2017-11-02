import { Component, OnInit } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/switchMap';

import { AccountService } from '../services/account.service';
import { Account, Transaction } from '../models/account';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit {

  account: Account;
  t_amount: number = 0.0;

  /* Variables used for mat-table */
  displayedColumns = ['t_type', 't_amount', 'balance', 'date'];
  dataSource: DataSource<Transaction> | null;
  dataChange: BehaviorSubject<Transaction[]> = new BehaviorSubject<Transaction[]>([]);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: AccountService) { }

  ngOnInit(): void {
    // Load account based on url
    this.route
      .paramMap
      .switchMap((params: ParamMap) => this.service.getAccount(params.get('id')))
      .subscribe(
        (res: Account) => {
          this.account = res;
          // Reverse transactions to date is in descending order
          this.account.transactions.reverse();
          this.dataSource = new AccountDataSource(this.dataChange);
          this.dataChange.next(this.account.transactions);
        },
        (err: HttpErrorResponse) => {
          // Reroute back to home page if account does not exist
          this.router.navigate(['/']);
        });
  }

  depositOrWithdraw(transaction_type: string): void {
    // Verify input
    if (isNaN(this.t_amount) || this.t_amount <= 0) {
      return;
    }

    this.service
      .updateBalance(this.account._id, transaction_type, this.t_amount)
      .subscribe((res: Transaction) => {
        this.account.transactions.unshift(res);
        this.updateBalance();
        this.dataChange.next(this.account.transactions);
      });
  }

  advanceTime(months: number): void {
    this.service
      .updateTime(this.account._id, months)
      .subscribe((res: Transaction[]) => {
        this.account.transactions.unshift(...res.reverse());
        this.updateBalance();
        this.dataChange.next(this.account.transactions);
      });
  }

  updateBalance(): void {
    this.account.balance = this.account.transactions[0].balance;
  }

  parseTransactionType(t: string): string {
    switch(t) {
      case 'd':
        return 'Deposit';
      case 'w':
        return 'Withdraw';
      case 'i':
        return 'Interest';
      default:
        return 'Unknown';
    }
  }
}

/* Helper class used for mat-table */
export class AccountDataSource extends DataSource<Transaction> {

  constructor(
    private dataChange: BehaviorSubject<Transaction[]>) {
    super();
  }

  connect(): Observable<Transaction[]> {
    return Observable.merge(this.dataChange);
    /*
    return Observable.of(
      this.dataChange.subscribe(
        (res: Transaction[]) => {return res;},
        (err) => {console.log(err);},
        () => {console.log('Completed');}
    ));
    */
  }

  disconnect() {}
}
