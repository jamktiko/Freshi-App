import { inject, Injectable, signal } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import cordovaSQLiteDriver from 'localforage-cordovasqlitedriver';
import { IDeletedProduct, ILocalProduct, IUpdateLocal } from './product';
@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private _storage: Storage | null = null;
  private readonly STORAGE_KEY = 'freshi_storage';
  private readonly SYNC_KEY = 'freshi_sync';
  private readonly DELETIONS_KEY = 'freshi_deletions';
  private readonly EMAIL_KEY = 'freshi_email';

  constructor(private storage: Storage) {
    this.init();
  }

  public products = signal<ILocalProduct[]>([]);
  public email = signal<string>('');

  // Setup storage
  async init() {
    await this.storage.defineDriver(cordovaSQLiteDriver);
    const storage = await this.storage.create();
    this._storage = storage;
    const products = await this.getProducts();
    this.products.set(products);
    const email = await this.getEmail();
    this.email.set(email);
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
    try {
      await this._storage?.set(this.SYNC_KEY, lastSync);
    } catch (error) {
      alert('Failed to set last sync time to storage');
    }
  }

  // SET REGISTRATION EMAIL TO STORAGE
  async setEmail(email: string) {
    try {
      await this._storage?.set(this.EMAIL_KEY, email);
    } catch (error) {
      alert('Failed to set email to storage: ' + error);
    }
  }
  async getEmail() {
    const email = await this._storage?.get(this.EMAIL_KEY);
    return email ?? '';
  }

  //Get deleted products, that haven't been synced
  async getDeletions() {
    const deletions: IDeletedProduct[] = await this._storage?.get(
      this.DELETIONS_KEY,
    );
    return deletions ?? [];
  }

  // Save a new deleted product to deletions array, if sync wasn't successfull
  async addDeletion(deletion: IDeletedProduct) {
    const deletions = await this.getDeletions();
    try {
      deletions.push(deletion);
      await this._storage?.set(this.DELETIONS_KEY, deletions);
    } catch (error) {
      alert('Error saving deletion ' + error);
    }
  }
  // remove product from deletions
  async removeDeletion(deletion: string) {
    const deletions = await this.getDeletions();
    const newDeletions = deletions.filter((item) => item.itemId !== deletion);
    try {
      await this._storage?.set(this.DELETIONS_KEY, newDeletions);
    } catch (error) {
      alert('Error setting new deletion array: ' + error);
    }
  }

  // Add product to storage
  async addProduct(newProduct: ILocalProduct) {
    let newProductList: ILocalProduct[] = [];
    this.products.update((oldProducts) => {
      newProductList = [...oldProducts, newProduct];
      return newProductList;
    });
    await this._storage?.set(this.STORAGE_KEY, newProductList);
  }

  // Remove product
  async removeProduct(removedProductId: string) {
    let newProductList: ILocalProduct[] = [];
    this.products.update((oldProducts) => {
      newProductList = oldProducts.filter(
        (product) => product.itemId !== removedProductId,
      );
      return newProductList;
    });
    await this._storage?.set(this.STORAGE_KEY, newProductList);
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
