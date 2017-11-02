import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AccountService } from '../services/account.service';
import { Account, Transaction } from '../models/account';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  private interest_rate: number = 0.01;

  constructor(
    private router: Router,
    private service: AccountService) { }

  ngOnInit(): void {
  }

  createAccount(): void {
    this.service
      .createAccount(this.interest_rate)
      .subscribe(res => {this.router.navigate(['/account', res._id])});
  }

  sliderChange(e): void {
    this.interest_rate = e.value;
  }
}
