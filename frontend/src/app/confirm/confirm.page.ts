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
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import {
  ReactiveFormsModule,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Cognito } from '../cognito';

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
    IonTitle,
    IonContent,
    ReactiveFormsModule,
    ExploreContainerComponent,
  ],
})
export class ConfirmPage {
  cognito = inject(Cognito);
  confirmation = new FormGroup({
    email: new FormControl('', [Validators.email, Validators.required]),
    code: new FormControl('', [Validators.required]),
  });

  constructor() {}

  submitConfirmation() {
    if (
      typeof this.confirmation.value.email === 'string' &&
      typeof this.confirmation.value.code === 'string'
    ) {
      this.cognito.confirmUser(
        this.confirmation.value.email,
        this.confirmation.value.code,
      );
    } else {
      alert('Email or code is invalid!');
    }
  }
}
