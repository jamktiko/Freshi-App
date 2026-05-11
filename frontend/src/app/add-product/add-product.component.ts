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
      const ocrTexts = textData.textDetections.map(
        (detection) => detection.text,
      );
      this.detectedTexts.set(textData.textDetections);
      const ocrResponse: IOcrResponse | null = await this.api.sendOCR(ocrTexts);
      this.returnedOCR.set(ocrResponse);
    }
  }
  // Send test string array to amazon bedrock
  async testBedrock() {
    this.api.sendOCR([
      'Freshi logo',
      'TEHTY',
      'PIETARSAARESSA,',
      'SUOMALAISESTA',
      'LIHASTA.',
      'TILLVERKAT I JAKOBSTAD.',
      'AV FINSKT KÖTT.',
      'VREaonLVNN',
      'GMOAPAA',
      'SNELLMAN',
      'FRI',
      'EST. 1951',
      'SIKA-NAUTA',
      'JAUHELIHA',
      'KUNNON',
      'MALET KÖTT V GRIS oCH NÖT',
      '<23%',
      'RASVAA',
      'FETT',
      'AINA TUORETTA',
      '700 G',
      'RU',
      'OMAS',
      'MAASTA',
    ]);
  }

  ngOnInit() {}
}
