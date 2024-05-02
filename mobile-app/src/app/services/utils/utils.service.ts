import { Injectable } from '@angular/core';
import { PhotoService } from '../photo.service';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  constructor(private photoService: PhotoService) { }

  createUrl(selectedDate: string, selectedDescription: string): string {
    let url = window.location.pathname + "?";
    if (selectedDate !== "") {
      url += "date=" + selectedDate + "&";
    }
    if (selectedDescription !== "") {
      url += "search=" + selectedDescription + "&";
    }
    return url;
  }

  parseDate() {
    let date = new Date().toISOString();
    let aux = date.split("T");
    let dateObj = { date: "", time: "" };
    dateObj["date"] = aux[0];
    dateObj["time"] = aux[1].split(".")[0];
    return dateObj;
  }

  checkOperatorDeleted(operator: string) {
    if (operator == undefined)
      return "";
    return operator == "Utente eliminato" ? "deleted" : "";
  }

  getCoordsFromUrl(indications: string): any {
    if (indications) {
      const aus = indications.split(',');
      return {
        lat: parseFloat(aus[0]),
        lng: parseFloat(aus[1])
      };
    }
  }

  async openModal(modal: any, photo: any, position: number) {
    this.photoService.currentImageClicked = {
      index: position,
      url: photo.webviewPath,
      filepath: photo.filepath
    }
    modal.present();
  }

  closeModal(modal: any) {
    modal.dismiss();
  }

  getUserFromCache() {
    let cache: any = localStorage.getItem("ASSICURAZIONI");
    if (cache) {
      let parsedCache: any = JSON.parse(cache);
      return parsedCache.currentUser;
    }
    return null;
  }

}
