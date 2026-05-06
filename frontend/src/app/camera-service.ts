import { Injectable } from '@angular/core';
import { Ocr, TextDetections } from '@capacitor-community/image-to-text';
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
        targetWidth: 1200,
        cameraDirection: CameraDirection.Rear,
      });
    } catch (error) {
      console.log('taking a photo failed: ', error);
      return null;
    }
  }

  async detectText(photoFilePath: string) {
    try {
      const normalaizedPath = photoFilePath.startsWith('file://')
        ? photoFilePath
        : `file://${photoFilePath}`;
      const textData: TextDetections = await Ocr.detectText({
        filename: normalaizedPath,
      });
      return textData;
    } catch (error) {
      alert('ocr epäonnistui' + error);
      return null;
    }
  }
}
