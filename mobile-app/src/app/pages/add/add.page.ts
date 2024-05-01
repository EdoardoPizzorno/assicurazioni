import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ActionSheetController } from '@ionic/angular';
import { IonModal } from '@ionic/angular/common';
import { PeriziaService } from 'src/app/services/perizia.service';
import { PhotoService, UserPhoto } from 'src/app/services/photo.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-add',
  templateUrl: './add.page.html',
  styleUrls: ['./add.page.scss'],
})
export class AddPage implements OnInit {

  @ViewChild('modal') modal!: IonModal;


  constructor(public photoService: PhotoService, public periziaService: PeriziaService, private router: Router) { }

  async ngOnInit() {
    await this.photoService.loadSaved();
  }

  addPhotoToGallery() {
    this.photoService.addNewToGallery();
  }

  async confirm() {
    this.periziaService.newPerizia.photos = this.photoService.images;
    await this.periziaService.add();
    await this.photoService.clearPictures();
    this.router.navigateByUrl('/home');
  }

  async openModal(photo: UserPhoto, position: number) {
    this.photoService.currentImageClicked = {
      index: position,
      url: photo.webviewPath,
      filepath: photo.filepath
    }
    this.modal.present();
  }

  closeModal() {
    this.modal.dismiss(null, 'cancel');
  }

  async deletePicture() {
    await this.photoService.deletePicture();
    this.modal.dismiss(null, 'cancel');
  }

}
