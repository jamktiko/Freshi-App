import { Component, computed, inject, OnInit, signal } from '@angular/core';
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
  ModalController,
} from '@ionic/angular/standalone';
import { SummaryCardComponent } from '../summary-card/summary-card.component';
import { Iproduct, mockProducts, IaddProduct } from '../product';
import { ProductCardComponent } from '../product-card/product-card.component';
import { AddProductComponent } from '../add-product/add-product.component';
@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
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
  ],
})
export class HomePage implements OnInit {
  productList = signal<Iproduct[]>([...mockProducts]);
  sortedList = computed<Iproduct[]>(() => {
    return [...this.productList()].sort(
      (a, b) =>
        new Date(a.expirationDate).getTime() -
        new Date(b.expirationDate).getTime(),
    );
  });
  number1 = 1; // number for testing
  private modalCtrl = inject(ModalController);
  constructor() {}

  // Opens a modal with the add-product component
  async addProductModal() {
    const modal = await this.modalCtrl.create({
      component: AddProductComponent,
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();

    // Saves added product
    // CURRENTLY SAVES ONLY TO AN ARRAY
    if (role === 'confirm') {
      try {
        const newProduct: Iproduct = {
          ItemId: crypto.randomUUID(),
          productName: data.name,
          brand: data.brand,
          category: data.category,
          expirationDate: data.expiration,
          openedDate: '',
          s3ImageKey: '',
          isDeleted: false,
        };
        this.productList.update((oldList) => [...oldList, newProduct]);
      } catch (error) {
        alert('Error adding new product: ' + error);
      }
    }
  }

  ngOnInit() {}
}
