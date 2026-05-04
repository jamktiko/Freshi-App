import { Component, inject } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonList,
  IonInput,
  IonButton,
} from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import {
  ReactiveFormsModule,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Cognito } from '../cognito';
import { passwordMatchValidator } from '../passwordValidation';
import { Router } from '@angular/router';
import { autoSignIn } from 'aws-amplify/auth';

@Component({
  selector: 'app-register',
  templateUrl: 'register.page.html',
  styleUrls: ['register.page.scss'],
  imports: [
    IonButton,
    IonInput,
    IonList,
    IonItem,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    ReactiveFormsModule,
  ],
})
export class RegisterPage {
  router = inject(Router);
  cognito = inject(Cognito);

  // Registration form initialization
  registration = new FormGroup(
    {
      email: new FormControl('', [Validators.email, Validators.required]),
      passwordsGroup: new FormGroup(
        {
          password: new FormControl('', Validators.required),
          pconfirm: new FormControl('', Validators.required),
        },
        { validators: [Validators.minLength(8)] },
      ),
    },
    { validators: passwordMatchValidator },
  );

  constructor() {}

  // Registering user base on registration form input
  async submitRegistration() {
    // Check if email and password are of type string
    if (
      typeof this.registration.value.email === 'string' &&
      typeof this.registration.value.passwordsGroup?.password === 'string'
    ) {
      // Register credentials to aws cognito
      const register = await this.cognito.registerUser({
        username: this.registration.value.email,
        password: this.registration.value.passwordsGroup.password,
        options: {
          userAttributes: {
            email: this.registration.value.email,
          },
        },
      });
      // If registration succeeded
      if (register.success && register.nextStep?.signUpStep) {
        // REMOVE THIS CONSOLE LOG LATER
        console.log(
          'Next registration step is: ' + register.nextStep.signUpStep,
        );

        this.cognito.registrationEmail = this.registration.value.email;

        // Next step depends on what aws cognito returns upon registration
        switch (register.nextStep.signUpStep) {
          case 'CONFIRM_SIGN_UP':
            this.router.navigate(['/tabs/confirm']);
            break;
          case 'DONE':
            this.router.navigate(['/tabs/login']);
            break;
          case 'COMPLETE_AUTO_SIGN_IN':
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
      alert('Email or password is invalid!');
    }
  }
}
