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
import { EditProductComponent } from '../edit-product/edit-product.component';
import { ILocalProduct, IUpdateLocal } from '../product';
import { ApiService } from '../api-service';
import { StorageService } from '../storage';

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
  api = inject(ApiService);
  storageService = inject(StorageService);
  name!: string;

  //Props
  itemId!: string;
  productName!: string;
  productBrand!: string | null;
  productCategory!: string | null;
  expirationDate!: string;
  openedDate!: string | null;
  s3ImageKey!: string | null;

  photoWebPath = signal<string | null>(null);

  // FOR TEST PHOTOS FOR testing on browser
  randomPhotos = 5;
  testPhotoPath = '';

  expirationDateView = signal<string>('');
  months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  private modalCtrl = inject(ModalController);
  constructor() {}

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  ngOnInit() {
    this.getPhoto();
    this.setRandomTestPhoto();
    this.expirationDateView.set(
      `${this.months[new Date(this!.expirationDate).getMonth()]} ${new Date(this!.expirationDate).getDate()} ${new Date(this!.expirationDate).getFullYear()}`,
    ); // Set date to month dd yyyy
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
      if (!this.photoWebPath()) {
        if (this.s3ImageKey) {
          // If not stored localy try to get from s3
          const webPath = await this.api.getS3Url(this.s3ImageKey);
          this.photoWebPath.set(webPath);
        }
      }
    }
  }

  // Opens a modal with the add-product component
  async editProductModal() {
    const modal = await this.modalCtrl.create({
      component: EditProductComponent,
      componentProps: {
        nameInput: this.productName,
        brandInput: this.productBrand,
        categoryInput: this.productCategory,
        expirationInput: this.expirationDate,
        imageInput: this.photoWebPath(),
      },
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();

    // Saves added product

    if (role === 'confirm') {
      const formData = data.form;
      const uri = data.photoURI;
      const photoWebPath = data.photoWebPath;

      let s3imageKey: string | null = null;
      //IF photo was taken
      if (photoWebPath) {
        try {
          // Convert photo to blob for uploading
          const fetchResponse = await fetch(photoWebPath);
          const photoBlob = await fetchResponse.blob();

          // Resize image
          const resizedBlob = await this.cameraService.resizeImage(
            photoBlob,
            1200,
            1600,
          );

          // Try uploading to s3
          const uploadResponse = await this.api.uploadToS3(resizedBlob);

          if (uploadResponse.success) {
            s3imageKey = uploadResponse.data.s3imageKey;
          }
        } catch (error) {
          alert(
            'Error with image upload process: ' +
              `${typeof error === 'object' ? JSON.stringify(error, null, 2) : error}`,
          );
        }
      }
      //ALERT FOR TESTIGN
      //alert('THIS IS WHAT HOME PAGE RECEIVED: ' + uri);

      const editedProduct: IUpdateLocal = {
        itemId: this.itemId,
        productName: formData.name,
        brand: formData.brand ?? null,
        category: formData.category ?? null,
        S3imageKey: s3imageKey,
        expirationDate: formData.expiration,
        synced: false,
        lastUpdate: new Date().toISOString(),
        confidence: null,
      };

      try {
        const postProductResponse = await this.api.updateProduct(editedProduct);

        if (postProductResponse.success) {
          editedProduct.synced = true;
        }
      } catch (error) {
        alert('Error updating product: ' + error);
      }
      this.storageService.updateProduct(editedProduct);
      if (uri) {
        this.cameraService.savePhoto(uri, this.itemId);
      }
      this.productName = editedProduct.productName ?? this.productName;
      this.productBrand = editedProduct.brand ?? null;
      this.productCategory = editedProduct.category ?? null;
      this.expirationDate = editedProduct.expirationDate ?? this.expirationDate;
    }
  }
  async deleteItem() {
    try {
      console.log('start of try');
      const deleteResponse = await this.api.deleteProduct(this.itemId);
      if (deleteResponse.success) {
        await this.storageService.removeProduct(this.itemId);

        return this.modalCtrl.dismiss(null, 'cancel');
      }
      return this.modalCtrl.dismiss(null, 'cancel');
    } catch (error) {
      await this.storageService.removeProduct(this.itemId);
      await this.storageService.addDeletion({
        itemId: this.itemId,
        operation: 'DELETE',
        clientUpdatedAt: new Date().toISOString(),
      });
      return this.modalCtrl.dismiss(null, 'cancel');
    }
  }
}
