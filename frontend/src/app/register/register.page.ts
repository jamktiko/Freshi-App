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
    ExploreContainerComponent,
    ReactiveFormsModule,
  ],
})
export class RegisterPage {
  cognito = inject(Cognito);
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

  submitRegistration() {
    if (
      typeof this.registration.value.email === 'string' &&
      typeof this.registration.value.passwordsGroup?.password === 'string'
    ) {
      this.cognito.registerUser({
        username: this.registration.value.email,
        password: this.registration.value.passwordsGroup.password,
        options: {
          userAttributes: {
            email: this.registration.value.email,
          },
        },
      });
    } else {
      alert('Email or password is invalid!');
    }
  }
}
