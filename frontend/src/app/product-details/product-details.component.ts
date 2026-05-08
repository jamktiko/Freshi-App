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

  // FOR TEST PHOTOS FOR testing on browser
  randomPhotos = 5;
  testPhotoPath = '';

  private modalCtrl = inject(ModalController);
  constructor() {}

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  ngOnInit() {
    this.getPhoto();
    this.setRandomTestPhoto();
  }

  async setRandomTestPhoto() {
    const randomNumber = Math.floor(Math.random() * this.randomPhotos);
    const randomPhoto = `assets/testImages/Gemini_missingFood_${randomNumber + 1}.jpg`;
    this.testPhotoPath = randomPhoto;
  }

  async getPhoto() {
    if (this.itemId) {
      const webPath = await this.cameraService.readPhoto(this.itemId);
      this.photoWebPath.set(webPath);
    }
  }
}
