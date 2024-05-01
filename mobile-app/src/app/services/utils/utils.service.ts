import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  constructor() { }

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

  substituteFields(perizia: any, fields: any) {
    let comments: any = [];

    for (let i = 0; i < fields.comments.length; i++) {
      comments.push({ "text": fields.comments[i].innerHTML, "imageIndex": fields.comments[i].id });
    }

    perizia.description = fields.description;
    perizia.date = fields.date;
    perizia.time = fields.time;

    let count = 0;
    let prevImageIndex = 0;
    comments.forEach((comment: any) => {
      if (comment.imageIndex != prevImageIndex) {
        count = 0;
        prevImageIndex = comment.imageIndex;
      }
      perizia.photos[comment.imageIndex].comments[count++] = comment.text;
    });
    return perizia;
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

  getUserFromCache() {
    let cache: any = localStorage.getItem("ASSICURAZIONI");
    if (cache) {
      let parsedCache: any = JSON.parse(cache);
      return parsedCache.currentUser;
    }
    return null;
  }

}
