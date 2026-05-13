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

  // Opens a modal with the add-product component
  async editProductModal() {
    const modal = await this.modalCtrl.create({
      component: EditProductComponent,
      componentProps: {
        nameInput: this.productName,
        brandInput: this.productBrand,
        categoryInput: this.productCategory,
        expirationInput: this.expirationDate,
        imageInput: this.photoWebPath,
      },
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();

    // Saves added product
    // CURRENTLY SAVES ONLY TO AN ARRAY
    if (role === 'confirm') {
      const formData = data.form;
      const uri = data.photoURI;

      //ALERT FOR TESTIGN
      //alert('THIS IS WHAT HOME PAGE RECEIVED: ' + uri);

      const editedProduct: IUpdateLocal = {
        itemId: this.itemId,
        productName: formData.name,
        brand: formData.brand ?? null,
        category: formData.category ?? null,
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
