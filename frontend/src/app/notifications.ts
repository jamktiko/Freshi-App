import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Notifications {
  // Generate a Number notification id from product id string based on type of notification
  private generateNotificationID(
    productId: string,
    notificationType: 'expiring' | 'expired',
  ) {
    const idToConvert = `${productId}_${notificationType}`;

    // Convert id string to notification id (number)
    let hash = 0;
    for (let i = 0; i < idToConvert.length; i++) {
      const char = idToConvert.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  // Check if the product has notifications or not
  async syncNotifications(productId: string) {
    const expiringId = this.generateNotificationID(productId, 'expiring');
    const expiredId = this.generateNotificationID(productId, 'expired');
  }
}
