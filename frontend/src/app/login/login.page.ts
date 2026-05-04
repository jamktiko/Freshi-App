import { Component, inject, signal } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonInput,
  IonButton,
} from '@ionic/angular/standalone';

import { Cognito } from '../cognito';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { getCurrentUser } from 'aws-amplify/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: 'login.page.html',
  styleUrls: ['login.page.scss'],
  imports: [
    IonButton,
    IonItem,
    IonList,
    IonInput,
    IonHeader,
    IonToolbar,

    ReactiveFormsModule,
  ],
})
export class LoginPage {
  IDToken = signal('test');
  AccessToken = signal('test');

  router = inject(Router);
  cognito = inject(Cognito);

  // Form for logging in user
  login = new FormGroup({
    email: new FormControl('', [Validators.email, Validators.required]),
    password: new FormControl('', [Validators.required]),
  });

  constructor() {}

  // Logs user in with login form
  async submitLogin() {
    if (
      typeof this.login.value.email === 'string' &&
      typeof this.login.value.password === 'string'
    ) {
      const login = await this.cognito.loginUser(
        this.login.value.email,
        this.login.value.password,
      );
      if (login.success && login.nextStep) {
        switch (login.nextStep.signInStep) {
          case 'DONE':
            this.router.navigate(['/tabs/home']);
        }
      }
    } else {
      alert('Email or password is invalid!');
    }
  }

  // Logs user out
  submitLogout() {
    this.cognito.logoutUser();
  }

  // Get user tokens for testing
  async printTokens() {
    const tokens = await this.cognito.getTokens();
    this.AccessToken.set(tokens.accessToken.toString());
    if (tokens.idToken) {
      this.IDToken.set(tokens.idToken.toString());
    }
  }
}
