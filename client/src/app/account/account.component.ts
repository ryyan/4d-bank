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

  private account: Account;
  private account_id: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService) { }

  async ngOnInit() {
    this.route
      .paramMap
      .switchMap((params: ParamMap) => this.accountService.getAccount(params.get('id')))
      .subscribe((res: Account) => {
        this.account = res

        // Reroute back to home page if account does not exist
        if (this.account == null || this.account._id == '') {
          this.router.navigate(['/']);
        }
      });
  }
}
