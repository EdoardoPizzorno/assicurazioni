import { Component, OnInit } from '@angular/core';
import { ActionSheetController } from '@ionic/angular';
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

  constructor(public photoService: PhotoService, public periziaService: PeriziaService, private actionSheetController: ActionSheetController) { }

  async ngOnInit() {
    await this.photoService.loadSaved();
  }

  addPhotoToGallery() {
    this.photoService.addNewToGallery();
  }

  public async showActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Photos',
      buttons: [{
        text: 'Delete',
        role: 'destructive',
        icon: 'trash',
        handler: () => {
          this.photoService.deletePicture();
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

}
