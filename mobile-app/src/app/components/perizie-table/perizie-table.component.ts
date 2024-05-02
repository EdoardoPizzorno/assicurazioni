import { Component, ViewChild } from '@angular/core';
import { PeriziaService } from '../../services/perizia.service';
import { Router } from '@angular/router';
import { UtilsService } from '../../services/utils/utils.service';
import { LoginService } from '../../services/login.service';
import { GoogleMapsService } from '../../services/google-maps.service';
import { UserService } from 'src/app/services/user.service';
import { PhotoService } from 'src/app/services/photo.service';

@Component({
  selector: 'perizie-table',
  templateUrl: './perizie-table.component.html',
  styleUrl: './perizie-table.component.css'
})
export class PerizieTableComponent {

  selectedDescription: string = "";
  selectedDate: string = "";
  textInput: string = "";

  @ViewChild('imagesModal') imagesModal: any;

  constructor(private userService: UserService, public periziaService: PeriziaService, public loginService: LoginService, public googleMapsService: GoogleMapsService, private router: Router, private utils: UtilsService, public photoService: PhotoService) { }

  async ngOnInit() {
    this.selectedDate = this.router.parseUrl(this.router.url).queryParams["date"] || "";
    this.selectedDescription = this.router.parseUrl(this.router.url).queryParams["search"] || "";
    if (!this.userService.currentUser) {
      await this.userService.getUser();
    }
    if (!this.periziaService.perizie) {
      await this.periziaService.getPerizie();
    }
  }

  async filter() {
    let url = this.utils.createUrl(this.selectedDate, this.selectedDescription)
    await this.router.navigateByUrl(url);
    await this.periziaService.getPerizie();
  }

  async removeFilter(filterType: string) {
    if (filterType === "date") {
      this.selectedDate = "";
    } else if (filterType === "description") {
      this.selectedDescription = "";
    } else if (filterType === "indications") {
      await this.router.navigateByUrl('/home');
      window.location.reload();
    }

    const url = this.utils.createUrl(this.selectedDate, this.selectedDescription);
    await this.router.navigateByUrl(url);
    await this.periziaService.getPerizie();
  }

  async loadIndications(coords: any) {
    await this.router.navigateByUrl('/home?indications=' + coords.lat + ',' + coords.lng
      + "&travelMode=" + this.googleMapsService.travelMode);
    await this.googleMapsService.getDirections();
    window.location.reload();
  }

  //#region MODAL MANAGEMENT

  openEditModal(perizia: any) {
    this.periziaService.currentEditPerizia = perizia;
    this.imagesModal.present();
  }

  confirm() {
    this.periziaService.update(this.periziaService.currentEditPerizia);
    this.closeModal();
  }

  closeModal() {
    this.utils.closeModal(this.imagesModal);
  }

  //#endregion

  //#region IMAGES MANAGEMENT

  deletePicture(imageIndex: number, isNewPhoto: boolean = false) {
    if (isNewPhoto) {
      this.photoService.currentImageClicked.newPhotos.splice(imageIndex, 1);
    } else {
      this.periziaService.currentEditPerizia.photos.splice(imageIndex, 1);
    }
  }

  //#endregion

  //#region COMMENTS MANAGEMENT

  addComment(imageIndex: number, isNewPhoto: boolean = false) {
    let currentPhotos = isNewPhoto ? this.periziaService.currentEditPerizia.newPhotos[imageIndex] : this.periziaService.currentEditPerizia.photos[imageIndex];
    if (this.textInput.trim() !== '') {
      console.log(currentPhotos)
      if (!currentPhotos.comments)
        currentPhotos.comments = [];
      currentPhotos.comments.push(this.textInput.trim());
      this.textInput = '';
    }
  }

  removeComment(imageIndex: number, commentIndex: number, isNewPhoto: boolean = false) {
    let currentComments = isNewPhoto ? this.periziaService.currentEditPerizia.newPhotos[imageIndex].comments : this.periziaService.currentEditPerizia.photos[imageIndex].comments;
    currentComments.splice(commentIndex, 1);
  }

  //#endregion

}
