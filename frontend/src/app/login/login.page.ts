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
  IonButtons,
  IonBackButton,
  IonNote,
} from '@ionic/angular/standalone';

import { Cognito } from '../cognito';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { getCurrentUser, resendSignUpCode } from 'aws-amplify/auth';
import { Router } from '@angular/router';
import { StorageService } from '../storage';

@Component({
  selector: 'app-login',
  templateUrl: 'login.page.html',
  styleUrls: ['login.page.scss'],
  imports: [
    IonButton,
    IonButtons,
    IonBackButton,
    IonItem,
    IonList,
    IonInput,
    IonHeader,
    IonToolbar,
    IonContent,
    ReactiveFormsModule,
    IonNote,
  ],
})
export class LoginPage {
  IDToken = signal('test');
  AccessToken = signal('test');
  storage = inject(StorageService);

  router = inject(Router);
  cognito = inject(Cognito);

  loginError = signal<string | null>(null);

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
            break;
          case 'CONFIRM_SIGN_UP':
            await this.storage.setEmail(this.login.value.email);
            resendSignUpCode({
              username: this.login.value.email,
            });
            this.router.navigate(['/tabs/confirm']);
            break;
        }
      }
      if (login.error?.name) {
        if (login.error.name === 'NotAuthorizedException') {
          if (login.error.message) {
            this.loginError.set(login.error.message);
          } else {
            this.loginError.set('Invalid username or password');
          }
        }
        if (login.error.name === 'UserNotFoundException') {
          if (login.error.message) {
            this.loginError.set(login.error.message);
          } else {
            this.loginError.set('User does not exist');
          }
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
