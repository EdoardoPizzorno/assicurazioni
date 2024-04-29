import { Component, OnInit, ViewChild } from '@angular/core';
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


  constructor(public photoService: PhotoService, public periziaService: PeriziaService, private actionSheetController: ActionSheetController, private userService: UserService) { }

  async ngOnInit() {
    await this.photoService.loadSaved();
  }

  addPhotoToGallery() {
    this.photoService.addNewToGallery();
  }

  public async showActionSheet(photo: UserPhoto, position: number) {
    const actionSheet = await this.actionSheetController.create({
      header: 'Photos',
      buttons: [{
        text: 'Delete',
        role: 'destructive',
        icon: 'trash',
        handler: () => {
          this.photoService.deletePicture(photo, position);
        }
      }, {
        text: 'Cancel',
        icon: 'close',
        role: 'cancel',
        handler: () => {
        }
      }]
    });
    await actionSheet.present();

  }

  confirm() {
    this.photoService.confirm();
    this.modal.dismiss(this.photoService.currentImageClicked.comments, 'confirm');
  }

  cancel() {
    this.modal.dismiss(null, 'cancel');
  }

  async openModal(photo: UserPhoto, position: number) {
    this.photoService.currentImageClicked.index = position;
    this.photoService.currentImageClicked.url = photo.webviewPath;
    this.modal.present();
  }

}
