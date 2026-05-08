import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonSearchbar,
  IonButton,
  IonFabButton,
  IonIcon,
  IonFab,
  IonModal,
  ModalController,
  IonList,
  IonItem,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
} from '@ionic/angular/standalone';
import { SummaryCardComponent } from '../summary-card/summary-card.component';
import { Iproduct, mockProducts, IaddProduct } from '../product';
import { ProductCardComponent } from '../product-card/product-card.component';
import { AddProductComponent } from '../add-product/add-product.component';
import { getCurrentUser } from 'aws-amplify/auth';
import { Router } from '@angular/router';
import { StorageService } from '../storage';
import { Cognito } from '../cognito';
import { ProductDetailsComponent } from '../product-details/product-details.component';
import { CameraService } from '../camera-service';
@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    IonItemOption,
    IonItemOptions,
    IonItemSliding,
    IonItem,
    IonList,
    IonFab,
    IonIcon,
    IonFabButton,
    IonButton,
    IonButtons,
    IonMenuButton,
    IonSearchbar,
    IonContent,
    IonHeader,
    IonToolbar,
    CommonModule,
    FormsModule,
    SummaryCardComponent,
    ProductCardComponent,
  ],
})
export class HomePage implements OnInit {
  cameraService = inject(CameraService);
  storageService = inject(StorageService);
  router = inject(Router);

  productSearch = signal('');
  randomGreeting = '';

  private greetings = [
    'Stay fresh!',
    'Great to see you!',
    'What’s cooking?',
    'Welcome back!',
    'Your kitchen missed you!',
    'Nice to see you again!',
    'It´s a treat to see you!',
    'Hello, friend!',
    'Time for a quick check?',
    'Hi there!',
    'Ready to dive in?',
  ];

  productList = computed<Iproduct[]>(() => {
    const products = this.storageService.products();
    const search = this.productSearch().toLowerCase();
    if (!products || !Array.isArray(products)) {
      return [];
    }

    const filteredProducts = products.filter(
      (product) =>
        product.brand?.toLowerCase().includes(search) ||
        product.category?.toLowerCase().includes(search) ||
        product.productName?.toLowerCase().includes(search),
    );
    return filteredProducts;
  });

  number1 = 1; // number for testing
  private modalCtrl = inject(ModalController);
  constructor() {}

  // Open a modal to show product details
  async showDetails(product: Iproduct) {
    const modal = await this.modalCtrl.create({
      component: ProductDetailsComponent,
      componentProps: {
        itemId: product.ItemId,
        productName: product.productName,
        productBrand: product.brand,
        productCategory: product.category,
        expirationDate: product.expirationDate,
        openedDate: product.openedDate,
      },
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();
  }

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
        const formData = data.form;
        const uri = data.photoURI;

        //ALERT FOR TESTIGN
        //alert('THIS IS WHAT HOME PAGE RECEIVED: ' + uri);

        const itemId = crypto.randomUUID();
        const newProduct: Iproduct = {
          ItemId: itemId,
          productName: formData.name,
          brand: formData.brand,
          category: formData.category,
          expirationDate: formData.expiration,
          openedDate: '',
          s3ImageKey: '',
          isDeleted: false,
        };
        this.storageService.addProduct(newProduct);
        if (uri) {
          this.cameraService.savePhoto(uri, itemId);
        }
      } catch (error) {
        alert('Error adding new product: ' + error);
      }
    }
  }

  ngOnInit() {
    this.randomGreeting =
      this.greetings[Math.floor(Math.random() * this.greetings.length)];
  }

  deleteItem(deletedItem: Iproduct) {
    this.storageService.removeProduct(deletedItem);
  }
}
