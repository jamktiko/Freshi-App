import { Injectable } from '@angular/core';
import { Camera, CameraDirection } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
@Injectable({
  providedIn: 'root',
})
export class CameraService {
  async takePhoto() {
    try {
      return await Camera.takePhoto({
        quality: 90,
        targetWidth: 1024,
        cameraDirection: CameraDirection.Rear,
      });
    } catch (error) {
      console.log('taking a photo failed: ', error);
      return null;
    }
  }
}
