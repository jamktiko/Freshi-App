import { inject, Injectable, signal } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import cordovaSQLiteDriver from 'localforage-cordovasqlitedriver';
import { Iproduct } from './product';
@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private _storage: Storage | null = null;
  private readonly STORAGE_KEY = 'freshi_storage';

  constructor(private storage: Storage) {
    this.init();
  }

  public products = signal<Iproduct[]>([]);

  // Setup storage
  async init() {
    await this.storage.defineDriver(cordovaSQLiteDriver);
    const storage = await this.storage.create();
    this._storage = storage;
    const products = await this.getProducts();
    this.products.set(products);
  }

  // Get array of products from storage
  async getProducts(): Promise<Iproduct[]> {
    const products: Iproduct[] = await this._storage?.get(this.STORAGE_KEY);
    return products ?? []; // Returns products or if products is null, return empty array
  }

  // Add product to storage
  async addProduct(newProduct: Iproduct) {
    this.products.update((oldProducts) => {
      const newProducts = [...oldProducts, newProduct];
      this._storage?.set(this.STORAGE_KEY, newProducts);
      return newProducts;
    });
  }

  // Remove product
  async removeProduct(removedProduct: Iproduct) {
    this.products.update((oldProducts) => {
      const newProducts = oldProducts.filter(
        (product) => product.ItemId !== removedProduct.ItemId,
      );
      this._storage?.set(this.STORAGE_KEY, newProducts);
      return newProducts;
    });
  }

  // Update product
  async updateProduct(updatedProduct: Iproduct) {
    this.products.update((oldProducts) => {
      const index = oldProducts.findIndex(
        (product) => product.ItemId === updatedProduct.ItemId,
      );
      if (index !== -1) {
        oldProducts[index] = updatedProduct;
      }
      this._storage?.set(this.STORAGE_KEY, oldProducts);
      return oldProducts;
    });
  }
}
