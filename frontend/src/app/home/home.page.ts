import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonSearchbar,
  IonButton,
  IonFabButton,
  IonIcon,
  IonFab,
  IonModal,
} from '@ionic/angular/standalone';
import { SummaryCardComponent } from '../summary-card/summary-card.component';
import { Iproduct, mockProducts } from '../product';
import { ProductCardComponent } from '../product-card/product-card.component';
import { AddProductComponent } from '../add-product/add-product.component';
@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    IonModal,
    IonFab,
    IonIcon,
    IonFabButton,
    IonButton,
    IonSearchbar,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    SummaryCardComponent,
    ProductCardComponent,
    AddProductComponent,
  ],
})
export class HomePage implements OnInit {
  productList = signal<Iproduct[]>([...mockProducts]);
  number1 = 1; // number for testing
  constructor() {}

  ngOnInit() {}
}
