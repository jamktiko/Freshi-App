import { Component, inject, OnInit, signal } from '@angular/core';
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
import { CameraService } from '../camera-service';

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
  cameraService = inject(CameraService);
  name!: string;

  //Props
  itemId!: string | null;
  productName!: string;
  productBrand!: string | null;
  productCategory!: string | null;
  expirationDate!: string;
  openedDate!: string | null;

  photoWebPath = signal<string | null>(null);

  private modalCtrl = inject(ModalController);
  constructor() {}

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  ngOnInit() {}

  async getPhoto() {
    if (this.itemId) {
      const webPath = await this.cameraService.readPhoto(this.itemId);
      this.photoWebPath.set(webPath);
    }
  }
}
