import { Component, inject, OnInit } from '@angular/core';
import {
  IonItem,
  IonInput,
  IonList,
  IonImg,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  ModalController,
  IonContent,
  IonIcon,
  IonLabel,
  IonNote,
  IonListHeader,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss'],
  imports: [
    IonListHeader,
    IonNote,
    IonLabel,
    IonIcon,
    IonContent,
    IonButton,
    IonButtons,
    IonToolbar,
    IonHeader,
    IonImg,
    IonList,
    IonItem,
  ],
})
export class ProductDetailsComponent implements OnInit {
  name!: string;

  //Props
  itemId!: string | null;
  productName!: string;
  productBrand!: string | null;
  productCategory!: string | null;
  expirationDate!: string;
  openedDate!: string | null;

  private modalCtrl = inject(ModalController);
  constructor() {}

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  ngOnInit() {}
}
