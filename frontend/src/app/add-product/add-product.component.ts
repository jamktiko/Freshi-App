import { Component, OnInit, ViewChild } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonTitle,
  IonButton,
  IonIcon,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.scss'],
  imports: [
    IonIcon,
    IonButton,
    IonTitle,
    IonBackButton,
    IonButtons,
    IonHeader,
    IonToolbar,
  ],
})
export class AddProductComponent implements OnInit {
  @ViewChild(IonModal) modal!: IonModal;

  cancel() {
    this.modal.dismiss(null, 'cancel');
  }
  constructor() {}

  ngOnInit() {}
}
