import { Component, inject, OnInit, ViewChild } from '@angular/core';
import {
  FormControl,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonTitle,
  IonButton,
  IonIcon,
  ModalController,
  IonList,
  IonInput,
  IonItem,
  IonContent,
} from '@ionic/angular/standalone';
import { Iproduct } from '../product';

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.scss'],
  imports: [
    IonItem,
    IonInput,
    IonList,
    IonIcon,
    IonButton,
    IonTitle,
    IonButtons,
    IonHeader,
    IonToolbar,
    ReactiveFormsModule,
    IonContent,
  ],
})
export class AddProductComponent implements OnInit {
  name!: string;
  private modalCtrl = inject(ModalController);

  // Form for product information
  productForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    brand: new FormControl('', [Validators.required]),
    category: new FormControl(''),
    expiration: new FormControl('', [Validators.required]),
  });
  constructor() {}
  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  submitProduct() {
    console.log(this.productForm.value);
    return this.modalCtrl.dismiss(this.productForm.value, 'confirm');
  }

  ngOnInit() {}
}
