import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';
import { Platform } from '@ionic/angular';
import { PeriziaService } from './perizia.service';
import { UtilsService } from './utils/utils.service';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  public photos: UserPhoto[] = [];
  private PHOTO_STORAGE: string = 'photos';
  private platform: Platform;

  images: any[] = [];
  currentImageClicked: any = {
    index: 0,
    url: "",
    comments: []
  }
  textInput: string = "";

  constructor(platform: Platform, private periziaService: PeriziaService) {
    this.platform = platform;
  }

  public async loadSaved() {
    const { value } = await Preferences.get({ key: this.PHOTO_STORAGE });
    this.photos = (value ? JSON.parse(value) : []) as UserPhoto[];

    if (!this.platform.is('hybrid')) {
      for (let photo of this.photos) {
        const readFile = await Filesystem.readFile({
          path: photo.filepath,
          directory: Directory.Data
        });

        photo.webviewPath = `data:image/jpeg;base64,${readFile.data}`;
        this.images.push({
          filepath: photo.filepath,
          url: photo.webviewPath,
          comments: []
        })
      }
    }

  }

  public async addNewToGallery(isEditMode: boolean = false) {
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100,
      allowEditing: true
    });

    await this.savePicture(capturedPhoto, isEditMode);

    Preferences.set({
      key: this.PHOTO_STORAGE,
      value: JSON.stringify(this.photos),
    });
  }

  private async savePicture(photo: Photo, isEditMode: boolean = false) {
    const base64Data = await this.readAsBase64(photo);

    const fileName = Date.now() + '.jpeg';
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Data
    });

    if (!isEditMode) {
      this.images.unshift({
        filepath: fileName,
        url: base64Data,
        comments: []
      });

      this.photos.unshift({
        filepath: fileName,
        webviewPath: photo.webPath
      });
    } else {
      this.periziaService.currentEditPerizia.newPhotos = []
      this.periziaService.currentEditPerizia.newPhotos.push({
        filepath: fileName,
        url: base64Data,
        comments: []
      });
    }

    if (this.platform.is('hybrid')) {
      return {
        filepath: savedFile.uri,
        webviewPath: Capacitor.convertFileSrc(savedFile.uri),
      };
    }
    else {
      return {
        filepath: fileName,
        webviewPath: photo.webPath
      };
    }
  }

  public async deletePicture(modal: any) {
    this.photos.splice(this.currentImageClicked.index, 1);

    Preferences.set({
      key: this.PHOTO_STORAGE,
      value: JSON.stringify(this.photos)
    });

    this.images.splice(this.currentImageClicked.index, 1);
    const filename = this.currentImageClicked.filepath
      .substr(this.currentImageClicked.filepath.lastIndexOf('/') + 1);

    await Filesystem.deleteFile({
      path: filename,
      directory: Directory.Data
    });

    modal.dismiss();

  }

  async clearPictures() {
    for (let photo of this.photos) {
      const filename = photo.filepath.substr(photo.filepath.lastIndexOf('/') + 1);
      await Filesystem.deleteFile({
        path: filename,
        directory: Directory.Data
      });
    }
    for (let photo of this.periziaService.currentEditPerizia.newPhotos) {
      const filename = photo.filepath.substr(photo.filepath.lastIndexOf('/') + 1);
      await Filesystem.deleteFile({
        path: filename,
        directory: Directory.Data
      });
    }

    this.photos = [];
    this.images = [];
    this.periziaService.currentEditPerizia.newPhotos = [];

    Preferences.set({
      key: this.PHOTO_STORAGE,
      value: JSON.stringify(this.photos)
    });

  }

  addComment() {
    if (this.textInput.trim() !== '') {
      if (!this.images[this.currentImageClicked.index].comments)
        this.images[this.currentImageClicked.index].comments = [];
      this.images[this.currentImageClicked.index]["comments"].push(this.textInput.trim());
      this.textInput = '';
    }
  }

  removeComment(index: number) {
    this.images[this.currentImageClicked.index].comments.splice(index, 1);
  }

  //#region INTERNAL FUNCTIONS

  async readAsBase64(photo: Photo) {
    if (this.platform.is('hybrid')) {
      const file = await Filesystem.readFile({
        path: photo.path!
      });

      return file.data;
    }
    else {
      const response = await fetch(photo.webPath!);
      const blob = await response.blob();

      return await this.convertBlobToBase64(blob) as string;
    }
  }

  private convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });

  //#endregion

}

export interface UserPhoto {
  filepath: string;
  webviewPath?: string;
}