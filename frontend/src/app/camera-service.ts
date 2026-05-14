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
        quality: 80,
        targetWidth: 1200,
        targetHeight: 1600,
        cameraDirection: CameraDirection.Rear,
        includeMetadata: false,
      });
    } catch (error) {
      console.log('taking a photo failed: ', error);
      return null;
    }
  }

  // Make a smaller image for uploading
  async resizeImage(
    blob: Blob,
    maxWidth: number,
    maxHeight: number,
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(blob);
      img.src = url;

      img.onload = () => {
        URL.revokeObjectURL(url);

        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) return reject('Failed creating a canvas context');

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (resizedBlob) => {
            if (resizedBlob) resolve(resizedBlob);
            else reject('Making a blob failed');
          },
          'image/jpeg',
          0.8,
        );
      };

      img.onerror = (error) => reject(error);
    });
  }

  // Save given photo to application files
  async savePhoto(photoURI: string, fileName: string) {
    try {
      const fullFileName = `${fileName}.jpg`;
      const savedPhoto = await Filesystem.copy({
        from: photoURI,
        to: fullFileName,
        toDirectory: Directory.Data,
      });

      // FOR TESTING ONLY ALERT
      //alert('IMAGE SAVE SUCCESFULL' + savedPhoto.uri);

      console.log('Image save succesfully: ', savedPhoto);
    } catch (error) {
      alert('Saving the photo failed: ' + error);
    }
  }

  // Read a photo from storage
  async readPhoto(fileName: string) {
    try {
      const path = `${fileName}.jpg`;
      await Filesystem.stat({
        path: path,
        directory: Directory.Data,
      });
      const photoPath = await Filesystem.getUri({
        path: path,
        directory: Directory.Data,
      });

      // Convert photo path to usable by <img>
      const webPhotoPath = Capacitor.convertFileSrc(photoPath.uri);

      // FOR TESTING ONLY ALERT
      //alert('IMAGE PATH FOUND: ' + webPhotoPath);

      console.log('Image webpath fetched succesfully');
      return webPhotoPath;
    } catch (error) {
      // FOR TESTING TABLET
      //alert('FAILED TO LOAD IMAGE:  ' + error);
      console.warn('Failed to load image: ' + error);
      return null;
    }
  }

  // Detect text in images
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
