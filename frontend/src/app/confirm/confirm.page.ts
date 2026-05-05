import { Component, inject } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonInput,
  IonItem,
  IonButton,
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

@Component({
  selector: 'app-Confirm',
  templateUrl: 'confirm.page.html',
  styleUrls: ['confirm.page.scss'],
  imports: [
    IonButton,
    IonItem,
    IonInput,
    IonList,
    IonHeader,
    IonToolbar,

    ReactiveFormsModule,
  ],
})
export class ConfirmPage {
  router = inject(Router);
  cognito = inject(Cognito);

  // User registration confirmation form.
  confirmation = new FormGroup({
    code: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
      Validators.maxLength(6),
    ]),
  });

  constructor() {}

  // Confirms user base on confirmation form details
  async submitConfirmation() {
    // Check if type of code is a string
    if (typeof this.confirmation.value.code === 'string') {
      // Confirm email with code to aws cognito
      const confirmation = await this.cognito.confirmUser(
        this.cognito.registrationEmail,
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
