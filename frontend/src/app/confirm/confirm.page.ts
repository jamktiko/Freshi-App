import { Component, inject, signal } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonList,
  IonInput,
  IonButton,
  IonButtons,
  IonBackButton,
  IonNote,
} from '@ionic/angular/standalone';

import {
  ReactiveFormsModule,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Cognito } from '../cognito';
import { Router } from '@angular/router';
import { autoSignIn } from 'aws-amplify/auth';
import { StorageService } from '../storage';

@Component({
  selector: 'app-Confirm',
  templateUrl: 'confirm.page.html',
  styleUrls: ['confirm.page.scss'],
  imports: [
    IonNote,
    IonButton,
    IonButtons,
    IonBackButton,
    IonInput,
    IonList,
    IonItem,
    IonHeader,
    IonToolbar,
    IonContent,

    ReactiveFormsModule,
  ],
})
export class ConfirmPage {
  router = inject(Router);
  cognito = inject(Cognito);
  storage = inject(StorageService);

  codeCooldown = signal<boolean>(false);

  errorText = signal<string | null>(null);

  // User registration confirmation form.
  confirmation = new FormGroup({
    code: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
      Validators.maxLength(6),
    ]),
  });

  constructor() {}

  // Resend confirmation code to email
  async resendCode() {
    this.codeCooldown.set(true);
    const email = await this.storage.getEmail();
    console.log(email);
    const codeResponse = await this.cognito.resendCode(email);
    if (codeResponse?.error?.name) {
      if (codeResponse.error.name === 'LimitExceededException') {
        this.errorText.set(
          'Too many requests sent, wait a few minutes before retrying',
        );
        this.codeCooldown.set(false);
        return;
      }
    }
    setTimeout(() => {
      this.codeCooldown.set(false);
    }, 15000);
  }

  // Confirms user base on confirmation form details
  async submitConfirmation() {
    // Check if type of code is a string
    if (typeof this.confirmation.value.code === 'string') {
      const email = await this.storage.getEmail();
      // Confirm email with code to aws cognito
      const confirmation = await this.cognito.confirmUser(
        email,
        this.confirmation.value.code,
      );

      // Get next step from aws cognito
      if (confirmation.success && confirmation.nextStep) {
        // REMOVE THIS CONSOLE LOG LATER
        console.log(
          'Next registration step is: ' + confirmation.nextStep.signUpStep,
        );

        switch (confirmation.nextStep.signUpStep) {
          case 'DONE':
            this.router.navigate(['/tabs/login']);
            break;
          case 'CONFIRM_SIGN_UP':
            try {
              const { nextStep } = await autoSignIn();
              if (nextStep.signInStep === 'DONE') {
                this.router.navigate(['/tabs/home']);
              }
            } catch (error) {
              alert(error);
              this.router.navigate(['/tabs/login']);
            }
        }
      }
    } else {
      alert('Email or code is invalid!');
    }
  }
}
