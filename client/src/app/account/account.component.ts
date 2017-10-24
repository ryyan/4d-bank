import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: AccountService) { }

  ngOnInit(): void {
    // Load account based on url
    this.route
      .paramMap
      .switchMap((params: ParamMap) => this.service.getAccount(params.get('id')))
      .subscribe((res: Account) => {
        this.account = res

        // Reroute back to home page if account does not exist
        if (this.account == null) {
          this.router.navigate(['/']);
        }
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
        this.account.transactions.push(res);
        this.updateBalance();
      });
  }

  advanceTime(months: number): void {
    this.service
      .updateTime(this.account._id, months)
      .subscribe((res: Transaction[]) => {
        this.account.transactions.push(...res);
        this.updateBalance();
      });
  }

  updateBalance(): void {
    this.account.balance = this.account.transactions[this.account.transactions.length - 1].balance;
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
