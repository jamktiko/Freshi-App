import { Component } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonList,
  IonInput,
} from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import {
  ReactiveFormsModule,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: 'register.page.html',
  styleUrls: ['register.page.scss'],
  imports: [
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
  registration = new FormGroup(
    {
      email: new FormControl('', [Validators.email]),
      passwordsGroup: new FormGroup(
        {
          password: new FormControl(),
          pconfirm: new FormControl(),
        },
        { validators: [Validators.minLength(8)] },
      ),
    },
    { validators: Validators.required },
  );

  constructor() {}

  printForm() {
    console.log(this.registration.value);
  }
}
