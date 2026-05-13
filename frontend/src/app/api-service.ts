import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from 'src/environment/environment.prod';
import {
  ISentSyncProduct,
  IReceivedProduct,
  IProduct,
  IPostProduct,
  ISyncResponse,
  IUpdated,
  IPostProductResponse,
  IDeleteProductResponse,
  IDeletedProduct,
  IOcrResponse,
  IUpdateLocal,
} from './product';
import { StorageService } from './storage';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiURL: string = environment.apiURL;
  private http = inject(HttpClient);

  private storageService = inject(StorageService);

  getProducts(): Observable<IReceivedProduct> {
    return this.http.get<IReceivedProduct>(this.apiURL + '/items');
  }

  async postProduct(newProduct: IPostProduct | IUpdateLocal) {
    try {
      return await firstValueFrom(
        this.http.post<IPostProductResponse>(
          this.apiURL + '/items',
          newProduct,
        ),
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async updateProduct(newProduct: IPostProduct | IUpdateLocal) {
    try {
      return await firstValueFrom(
        this.http.put<IPostProductResponse>(
          this.apiURL + '/items/' + newProduct.itemId,
          newProduct,
        ),
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  // Send ocr-texts and reveice an object from aws bedrock
  async sendOCR(ocrText: string[]) {
    try {
      return await firstValueFrom(
        this.http.post<IOcrResponse>(this.apiURL + '/ai/analyze', {
          ocrText: ocrText,
        }),
      );
    } catch (error) {
      alert('Error sending ocr-texts: ' + error);
      return null;
    }
  }

  // Delete product from cloud

  async deleteProduct(productId: string) {
    return firstValueFrom(
      this.http.delete<IDeleteProductResponse>(
        this.apiURL + '/items/' + productId,
      ),
    );
  }

  // Syncs given products with backend and returns possibly new products
  private async syncProducts(unSyncedProducts: ISentSyncProduct[]) {
    const lastSync = await this.storageService.getSyncTime();
    console.log(lastSync);

    return firstValueFrom(
      this.http.post<ISyncResponse>(this.apiURL + '/items/sync', {
        lastSync: lastSync,
        unSyncedProducts,
      }),
    );
  }

  // Converting and Synchronizing products with backend
  async convertAndSyncProducts() {
    const unSyncedProducts = this.storageService
      .products()
      .filter((product) => product.synced === false);

    // Make a new array that is compatible with backend
    const syncProducts: ISentSyncProduct[] = unSyncedProducts.map(
      (product) => ({
        operation: 'CREATE',
        itemId: product.itemId,
        productName: product.productName,
        expirationDate: product.expirationDate,
        category: product.category,
        brand: product.brand,
        openedDate: product.openedDate,
        lastUpdate: product.lastUpdate,
        S3imageKey: product.S3imageKey,
        createdAt: product.createdAt,
        confidence: product.confidence,
      }),
    );

    // Send the unsynced products and receive updated and new products from server
    try {
      const syncResponse: ISyncResponse = await this.syncProducts(syncProducts);

      // If syncing was succesfull
      if (syncResponse.success) {
        // Set synced products status as "synced" in local storage
        for (const product of syncResponse.syncedClientItems) {
          await this.storageService.updateProduct({
            itemId: product.itemId,
            synced: true,
          });
        }

        // Set last sync time to server time
        await this.storageService.setSyncTime(syncResponse.syncToken);

        // Handle the received products
        // Make a map of the existing local product to compare id:s
        const existingProducts = this.storageService.products();
        const existingProductsMap = new Map(
          existingProducts.map((product) => [product.itemId, product]),
        );
        const updatedProducts: IUpdated[] = syncResponse.updated;
        // IF the received product is found in the map, update it, else add as new product
        for (const product of updatedProducts) {
          if (existingProductsMap.has(product.itemId)) {
            await this.storageService.updateProduct(product);
          } else {
            await this.storageService.addProduct({ ...product, synced: true });
          }
        }

        // Send deleted products that are unsynced if there are any
        const localDeletions: IDeletedProduct[] =
          await this.storageService.getDeletions();
        // If there are deletions
        if (localDeletions) {
          for (const deletion of localDeletions) {
            try {
              // Try to delete from cloud
              const deleted = await this.deleteProduct(deletion.itemId);
              // if success, remove from local deletions array
              if (deleted.success) {
                await this.storageService.removeDeletion(deletion.itemId);
              }

              // If backend returns success: false
              if (!deleted.success) {
                alert('Failed to delete product: ' + deletion.itemId);
              }
            } catch (error) {
              alert(
                'Error trying to delete product: ' +
                  deletion.itemId +
                  ' ' +
                  error,
              );
              break;
            }
          }
        }

        // Delete received deleted products
        const deletedCloudProducts = syncResponse.deleted;
        for (const product of deletedCloudProducts) {
          await this.storageService.removeProduct(product.itemId);
        }
      }
    } catch (error) {
      console.log(error);
      alert('Error syncing products' + error);
    }
  }
}
