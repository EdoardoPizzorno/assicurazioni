import { Component, OnInit, ViewChild } from '@angular/core';
import { ActionSheetController, ModalController } from '@ionic/angular';
import { IonModal } from '@ionic/angular/common';
import { PeriziaService } from 'src/app/services/perizia.service';
import { PhotoService, UserPhoto } from 'src/app/services/photo.service';

@Component({
  selector: 'app-add',
  templateUrl: './add.page.html',
  styleUrls: ['./add.page.scss'],
})
export class AddPage implements OnInit {

  textInput: string = "";
  labels: string[] = [];
  @ViewChild(IonModal) modal!: IonModal;

  constructor(public photoService: PhotoService, public periziaService: PeriziaService, private actionSheetController: ActionSheetController) { }

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

  addLabel() {
    if (this.textInput.trim() !== '') {
      this.labels.push(this.textInput.trim());
      this.textInput = '';
    }
  }

  removeLabel(index: number) {
    this.labels.splice(index, 1);
  }

  cancel() {
    console.log(this.modal)
    this.modal.dismiss(null, 'cancel');
  }

  confirm() {
    console.log(this.labels)
    this.modal.dismiss(this.labels, 'confirm');
  }

}
