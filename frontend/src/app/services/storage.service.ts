import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  constructor() {}

  /**
   * Saves an array of products to local storage
   */
  async saveProducts(products: any[]): Promise<void> {
    await Preferences.set({
      key: 'freshi_products',
      value: JSON.stringify(products),
    });
  }

  /**
   * Retrieves the saved products from local storage
   */
  async getProducts(): Promise<any[]> {
    const { value } = await Preferences.get({ key: 'freshi_products' });
    if (!value) return [];

    try {
      return JSON.parse(value);
    } catch (e) {
      console.error('Error parsing products from storage', e);
      return [];
    }
  }

  /**
   * Clears the products from local storage
   */
  async clearProducts(): Promise<void> {
    await Preferences.remove({ key: 'freshi_products' });
  }
}
