import { inject, Injectable, signal } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import cordovaSQLiteDriver from 'localforage-cordovasqlitedriver';
import { ILocalProduct, IUpdateLocal } from './product';
@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private _storage: Storage | null = null;
  private readonly STORAGE_KEY = 'freshi_storage';
  private readonly SYNC_KEY = 'freshi_sync';

  constructor(private storage: Storage) {
    this.init();
  }

  public products = signal<ILocalProduct[]>([]);

  // Setup storage
  async init() {
    await this.storage.defineDriver(cordovaSQLiteDriver);
    const storage = await this.storage.create();
    this._storage = storage;
    const products = await this.getProducts();
    this.products.set(products);
  }

  // Get array of products from storage
  async getProducts(): Promise<ILocalProduct[]> {
    const products: ILocalProduct[] = await this._storage?.get(
      this.STORAGE_KEY,
    );
    return products ?? []; // Returns products or if products is null, return empty array
  }

  // Get last sync time
  async getSyncTime(): Promise<string | null> {
    const syncTime = await this._storage?.get(this.SYNC_KEY);
    return syncTime ?? null;
  }

  //Set last sync time
  async setSyncTime(lastSync: string) {
    this._storage?.set(this.SYNC_KEY, lastSync);
  }

  // Add product to storage
  async addProduct(newProduct: ILocalProduct) {
    this.products.update((oldProducts) => {
      const newProducts = [...oldProducts, newProduct];
      this._storage?.set(this.STORAGE_KEY, newProducts);
      return newProducts;
    });
  }

  // Remove product
  async removeProduct(removedProductId: string) {
    this.products.update((oldProducts) => {
      const newProducts = oldProducts.filter(
        (product) => product.itemId !== removedProductId,
      );
      this._storage?.set(this.STORAGE_KEY, newProducts);
      return newProducts;
    });
  }

  // Update product
  async updateProduct(updatedProduct: IUpdateLocal) {
    let newProductList: ILocalProduct[] = [];
    this.products.update((oldProducts) => {
      newProductList = oldProducts.map((oldProduct) =>
        oldProduct.itemId === updatedProduct.itemId
          ? { ...oldProduct, ...updatedProduct }
          : oldProduct,
      );
      return newProductList;
    });
    await this._storage?.set(this.STORAGE_KEY, newProductList);
  }
}
