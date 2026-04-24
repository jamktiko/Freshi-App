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
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { Cognito } from '../cognito';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { getCurrentUser } from 'aws-amplify/auth';

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
    IonTitle,
    IonContent,
    ReactiveFormsModule,
  ],
})
export class LoginPage {
  IDToken = signal('test');
  AccessToken = signal('test');
  cognito = inject(Cognito);
  login = new FormGroup({
    email: new FormControl('', [Validators.email, Validators.required]),
    password: new FormControl('', [Validators.required]),
  });

  constructor() {}

  submitLogin() {
    if (
      typeof this.login.value.email === 'string' &&
      typeof this.login.value.password === 'string'
    ) {
      this.cognito.loginUser(this.login.value.email, this.login.value.password);
    } else {
      alert('Email or password is invalid!');
    }
  }
  submitLogout() {
    this.cognito.logoutUser();
  }
  async printTokens() {
    const tokens = await this.cognito.getTokens();
    this.AccessToken.set(tokens.accessToken.toString());
    if (tokens.idToken) {
      this.IDToken.set(tokens.idToken.toString());
    }
  }
}
