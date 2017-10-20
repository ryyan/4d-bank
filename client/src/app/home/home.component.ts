import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import 'rxjs/add/operator/switchMap';

import { AccountService } from '../services/account.service';
import { Account, Transaction } from '../models/account';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(
    private router: Router,
    private accountService: AccountService) { }

  ngOnInit() {
  }

  createAccount() {
    this.accountService
      .createAccount(0.01)
      .subscribe(res => {this.router.navigate(['/account', res._id])});
  }
}
