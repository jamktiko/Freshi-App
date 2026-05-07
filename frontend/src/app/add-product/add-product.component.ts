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
import { Iproduct } from '../product';
import { CameraService } from '../camera-service';
import { signIn } from 'aws-amplify/auth';
import {
  TextDetection,
  TextDetections,
} from '@capacitor-community/image-to-text';

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
  camera = inject(CameraService);

  // WebPath for displaying image
  imagePath = signal<string | null>(null);

  // URI for saving image
  imageUri: string | null = null;
  detectedTexts = signal<TextDetection[] | null>(null);

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
      this.imageUri = photo.uri;
    }
  }

  async detectText(photoFilePath: string) {
    const textData = await this.camera.detectText(photoFilePath);
    if (textData) {
      this.detectedTexts.set(textData.textDetections);
    }
  }

  ngOnInit() {}
}
