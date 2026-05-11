import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
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
  IonImg,
  IonSpinner,
} from '@ionic/angular/standalone';
import { ILocalProduct, IOcrResponse } from '../product';
import { CameraService } from '../camera-service';
import { signIn } from 'aws-amplify/auth';
import {
  TextDetection,
  TextDetections,
} from '@capacitor-community/image-to-text';
import { ApiService } from '../api-service';

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.scss'],
  imports: [
    IonSpinner,
    IonImg,
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
  api = inject(ApiService);
  camera = inject(CameraService);

  // If is loading ocr autofill texts
  isLoading = signal<boolean>(false);

  // WebPath for displaying image
  imagePath = signal<string | null>(null);

  // URI for saving image
  imageUri: string | null = null;
  detectedTexts = signal<TextDetection[] | null>(null);
  returnedOCR = signal<IOcrResponse | null>(null);
  name!: string;
  private modalCtrl = inject(ModalController);

  // Form for product information
  productForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    brand: new FormControl(''),
    category: new FormControl(''),
    expiration: new FormControl('', [Validators.required]),
  });
  constructor() {}
  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  submitProduct() {
    console.log(this.productForm.value);
    return this.modalCtrl.dismiss(
      {
        form: this.productForm.value,
        photoURI: this.imageUri,
      },
      'confirm',
    );
  }

  async takePhoto() {
    const photo = await this.camera.takePhoto();
    if (photo?.webPath) {
      this.imagePath.set(photo?.webPath);
      this.detectText(photo.uri!);
    }
    if (photo?.uri) {
      // FOR TESTING ONLY ALERT
      //alert('PHOTO URI DETECTED ' + photo.uri);
      this.imageUri = photo.uri;
    }
  }

  async detectText(photoFilePath: string) {
    const textData = await this.camera.detectText(photoFilePath);
    if (textData) {
      this.detectedTexts.set(textData.textDetections);
    }
  }
  async autoFillForm() {
    this.isLoading.set(true);
    // octObject contain coordinates of the detected texts AND the text and we need only the text

    const ocrObjects = this.detectedTexts();
    if (ocrObjects) {
      // Make a new array with just the texts
      const ocrTexts = ocrObjects.map((detection) => detection.text);

      // Delay, so loading won't happen too fast visually
      const delay = new Promise((resolve) => setTimeout(resolve, 2000));
      try {
        // Send ocr texts to aws bedrock and wait for response
        // Put delay and sendOcr to promise.all, so atleast the time of the delay is waited
        const [ocrResponse] = await Promise.all([
          this.api.sendOCR(ocrTexts),
          delay,
        ]);
        this.returnedOCR.set(ocrResponse);
        if (
          ocrResponse?.success &&
          ocrResponse.data.suggestion.status === 'OK'
        ) {
          const magicData = ocrResponse.data.suggestion;
          if (magicData.productName) {
            this.productForm.controls.name.setValue(magicData.productName);
            this.productForm.controls.name.markAsDirty();
          }
          if (magicData.brand) {
            this.productForm.controls.brand.setValue(magicData.brand);
            this.productForm.controls.brand.markAsDirty();
          }
          if (magicData.category) {
            this.productForm.controls.category.setValue(magicData.category);
            this.productForm.controls.category.markAsDirty();
          }
          if (magicData.expirationDate) {
            this.productForm.controls.expiration.setValue(
              magicData.expirationDate,
            );
            this.productForm.controls.expiration.markAsDirty();
          }
        }
      } catch (error) {
        alert('Error autofilling: ' + error);
      } finally {
        this.isLoading.set(false);
      }
    }
  }

  ngOnInit() {}
}
