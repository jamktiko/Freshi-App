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
  IonNote,
} from '@ionic/angular/standalone';
import { SummaryCardComponent } from '../summary-card/summary-card.component';
import { ILocalProduct, IPostProduct } from '../product';
import { ProductCardComponent } from '../product-card/product-card.component';
import { AddProductComponent } from '../add-product/add-product.component';
import { getCurrentUser } from 'aws-amplify/auth';
import { Router } from '@angular/router';
import { StorageService } from '../storage';
import { Cognito } from '../cognito';
import { ProductDetailsComponent } from '../product-details/product-details.component';
import { CameraService } from '../camera-service';
import { ApiService } from '../api-service';
@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    IonNote,
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
  api = inject(ApiService);
  cameraService = inject(CameraService);
  storageService = inject(StorageService);
  router = inject(Router);

  productSearch = signal('');
  activeFilter = signal<'All' | 'Expired' | 'Expiring' | 'Fresh'>('All');
  randomGreeting = '';
  randomEmptyMessage = '';

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

  private emptyMessages = [
    'Nothing to report.',
    'No items yet.',
    'All clear!',
    'A clean slate.',
  ];

  // How many days before expiring to set items as 'expiring'
  expiringDays = 3;

  // Summary card values computed
  expiredItems = computed<number>(() => {
    const products = this.storageService.products();
    const amount = products.reduce(
      (counter, product) =>
        this.getDaysLeft(product.expirationDate) < 0 ? (counter += 1) : counter,
      0,
    );
    return amount;
  });
  expiringItems = computed<number>(() => {
    const products = this.storageService.products();
    const amount = products.reduce(
      (counter, product) =>
        this.getDaysLeft(product.expirationDate) >= 0 &&
        this.getDaysLeft(product.expirationDate) <= this.expiringDays
          ? (counter += 1)
          : counter,
      0,
    );
    return amount;
  });
  freshItems = computed<number>(() => {
    const products = this.storageService.products();
    const amount = products.reduce(
      (counter, product) =>
        this.getDaysLeft(product.expirationDate) > this.expiringDays
          ? (counter += 1)
          : counter,
      0,
    );
    return amount;
  });

  ngOnInit() {
    this.randomGreeting =
      this.greetings[Math.floor(Math.random() * this.greetings.length)];
    this.randomEmptyMessage =
      this.emptyMessages[Math.floor(Math.random() * this.emptyMessages.length)];
    setTimeout(() => {
      try {
        getCurrentUser();
        this.syncProducts();
      } catch (error) {
        console.log('could not sync products on load', error);
      }
    }, 2000);
  }

  // Visible filtered and sorted product list
  productList = computed<ILocalProduct[]>(() => {
    const products = this.storageService.products();
    const search = this.productSearch().toLowerCase();
    const filter = this.activeFilter();
    if (!products || !Array.isArray(products)) {
      return [];
    }

    return products.filter((product) => {
      const matchesSearch =
        product.brand?.toLowerCase().includes(search) ||
        product.category?.toLowerCase().includes(search) ||
        product.productName?.toLowerCase().includes(search);

      let matchesStatus = true;
      if (filter !== 'All') {
        const days = this.getDaysLeft(product.expirationDate);
        if (filter === 'Fresh') matchesStatus = days > 3;
        else if (filter === 'Expiring') matchesStatus = days >= 0 && days <= 3;
        else if (filter === 'Expired') matchesStatus = days < 0;
      }

      return matchesSearch && matchesStatus;
    });
  });

  private getDaysLeft(isoDate: string): number {
    return Math.ceil((Date.parse(isoDate) - Date.now()) / (1000 * 3600 * 24));
  }

  toggleFilter(status: 'Expired' | 'Expiring' | 'Fresh') {
    this.activeFilter.set(this.activeFilter() === status ? 'All' : status);
  }

  number1 = 1; // number for testing
  private modalCtrl = inject(ModalController);
  constructor() {}

  // Open a modal to show product details
  async showDetails(product: ILocalProduct) {
    const modal = await this.modalCtrl.create({
      component: ProductDetailsComponent,
      componentProps: {
        itemId: product.itemId,
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
      const formData = data.form;
      const uri = data.photoURI;

      //ALERT FOR TESTIGN
      //alert('THIS IS WHAT HOME PAGE RECEIVED: ' + uri);

      const itemId = crypto.randomUUID();
      const newProduct: ILocalProduct = {
        itemId: itemId,
        productName: formData.name,
        brand: formData.brand ?? null,
        category: formData.category ?? null,
        expirationDate: formData.expiration,
        openedDate: null,
        S3imageKey: null,
        synced: false,
        createdAt: new Date().toISOString(),
        lastUpdate: new Date().toISOString(),
        confidence: null,
      };

      try {
        const postProductResponst = await this.api.postProduct(newProduct);

        if (postProductResponst.success) {
          newProduct.synced = true;
        }
      } catch (error) {
        alert('Error adding new product: ' + error);
      }
      this.storageService.addProduct(newProduct);
      if (uri) {
        this.cameraService.savePhoto(uri, itemId);
      }
    }
  }
  async syncProducts() {
    this.api.convertAndSyncProducts();
  }

  async deleteItem(deletedItem: ILocalProduct) {
    try {
      const deleteResponse = await this.api.deleteProduct(deletedItem.itemId);
      if (deleteResponse.success) {
        await this.storageService.removeProduct(deletedItem.itemId);
        return;
      }
    } catch (error) {
      console.log('HALOOOOOOOOOOO');
      await this.storageService.removeProduct(deletedItem.itemId);
      await this.storageService.addDeletion({
        itemId: deletedItem.itemId,
        operation: 'DELETE',
        clientUpdatedAt: new Date().toISOString(),
      });
      return;
    }
  }
}
