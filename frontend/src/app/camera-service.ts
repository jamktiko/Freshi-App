import { Injectable } from '@angular/core';
import { Ocr, TextDetections } from '@capacitor-community/image-to-text';
import { Camera, CameraDirection, MediaResult } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
@Injectable({
  providedIn: 'root',
})
export class CameraService {
  // Take a photo with device camera
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

  // Save given photo to application files
  async savePhoto(photo: MediaResult, fileName: string) {
    try {
      if (photo.uri) {
        const fullFileName = `${fileName}.jpg`;
        const savedPhoto = await Filesystem.copy({
          from: photo.uri,
          to: fullFileName,
          toDirectory: Directory.Data,
        });
      }
    } catch (error) {
      alert('Saving the photo failed: ' + error);
    }
  }

  // Read a photo from storage
  async readPhoto(fileName: string) {
    try {
      const photoPath = await Filesystem.getUri({
        path: fileName,
        directory: Directory.Data,
      });
      const webPhotoPath = Capacitor.convertFileSrc(photoPath.uri);
    } catch (error) {
      alert('Failed to load image: ' + error);
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
