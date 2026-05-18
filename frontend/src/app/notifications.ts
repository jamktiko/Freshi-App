import { Injectable } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { ILocalProduct } from './product';

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
  async syncNotifications(product: ILocalProduct) {
    // Generate notification id:s for expiring and expired notifications
    const expiringId = this.generateNotificationID(product.itemId, 'expiring');
    const expiredId = this.generateNotificationID(product.itemId, 'expired');

    // Get pending notifications and get theid ID:s
    const pending = await LocalNotifications.getPending();
    const pendingIds = pending.notifications.map((notif) => Number(notif.id));

    // Check if notifications missing
    const missingExpiredNotif = !pendingIds.includes(expiredId);
    const missingExpiringNotif = !pendingIds.includes(expiringId);

    if (missingExpiredNotif) {
      this.createNotification(
        expiredId,
        'expired',
        product.expirationDate,
        product.productName,
        product.brand,
      );
    }
    if (missingExpiringNotif) {
      this.createNotification(
        expiringId,
        'expiring',
        product.expirationDate,
        product.productName,
        product.brand,
      );
    }
  }
  private async createNotification(
    notificationId: number,
    type: 'expired' | 'expiring',
    expirationDate: string,
    productName: string,
    productBrand: string | null,
  ) {
    const permissions = await LocalNotifications.checkPermissions();
    if (permissions.display !== 'granted') {
      await LocalNotifications.requestPermissions();
    }
    let expirationDateTime: Date;
    if (type === 'expired') {
      // Get a new date from expirationDate string and set time to 10.00
      expirationDateTime = new Date(expirationDate);
      expirationDateTime.setHours(12, 0, 0, 0);
    } else {
      // Get a new date from expirationDate string and set time to 10.00 and 3 days before
      expirationDateTime = new Date(
        Date.parse(expirationDate) - 3 * 24 * 60 * 60 * 1000,
      );
      expirationDateTime.setHours(12, 0, 0, 0);
    }

    // IF notification time is in future, schedule it
    if (expirationDateTime.getTime() > Date.now()) {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: notificationId,
            title:
              type === 'expired'
                ? `Your product expires today!`
                : 'Your product is expiring 3 days!',
            body:
              type === 'expired'
                ? `Your ${productBrand} ${productName} expires today. Save it from the trash!`
                : `Your ${productBrand} ${productName} expires in 3 days. Consider using it soon!`,
            schedule: { at: expirationDateTime },
          },
        ],
      });
    }
  }

  // Delete a products notifications
  async deleteNotifications(productId: string) {
    try {
      const expiringNotif = await this.generateNotificationID(
        productId,
        'expiring',
      );
      const expiredNotif = await this.generateNotificationID(
        productId,
        'expired',
      );
      await LocalNotifications.cancel({
        notifications: [{ id: expiredNotif }, { id: expiredNotif }],
      });
    } catch (error) {
      alert('error deleting notifications! ' + error);
    }
  }
}
