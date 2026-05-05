import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonItem,
  IonButton,
  IonList,
} from '@ionic/angular/standalone';
import { getCurrentUser } from 'aws-amplify/auth';
import { Router } from '@angular/router';
import { Cognito } from '../cognito';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
  standalone: true,
  imports: [
    IonList,
    IonButton,
    IonItem,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
  ],
})
export class WelcomePage implements OnInit {
  cognito = inject(Cognito);
  router = inject(Router);
  constructor() {}

  ngOnInit() {
    // IF user is logged in, go to home

    this.init();
  }

  async init() {
    if (await this.cognito.getUser) {
      this.router.navigate(['/tabs/home']);
    }
  }
}
