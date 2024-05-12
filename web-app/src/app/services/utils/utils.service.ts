import { Injectable } from '@angular/core';
import { PeriziaService } from '../perizia.service';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  constructor() { }

  createUrl(selectedOperator: string, selectedDate: string, selectedDescription: string): string {
    let url = window.location.pathname + "?";
    if (selectedOperator !== "") {
      url += "operator=" + selectedOperator + "&";
    }
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

  generatePhotosHtml(images: any[]): string {
    let imagesHtml = "";
    images.forEach((image: any, index: number) => {
      const cardId = `card-${index}`;
      // Load images
      imagesHtml += `
        <div class="col-md-4">
          <div class="card m-3">
              <img src="${image.url}" class="card-img-top" alt="...">
              <div class="card-body">
                  <p class="card-title">Immagine fotografata da <b class="${this.checkOperatorDeleted(image.photographer)}">${image.photographer}</b></p>
                  <a class="text-decoration-none" data-bs-toggle="collapse" href="#comments-${cardId}" role="button" aria-expanded="false" aria-controls="comments-${cardId}">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-down" viewBox="0 0 16 16">
                          <path d="M7.646 10.646a.5.5 0 0 1 .708 0l4 4a.5.5 0 0 1-.708.708L8 11.707l-3.646 3.647a.5.5 0 1 1-.708-.708l4-4a.5.5 0 0 1 0-.708z"/>
                      </svg>
                  </a>
                  <div class="collapse" id="comments-${cardId}">
                      <div class="card card-body text-center" style="font-size: 10pt; vertical-align: middle !important;">
                          ${this.generateCommentsHtml(image.comments)}
                      </div>
                  </div>
              </div>
          </div>
        </div>
      `;
    });
    return imagesHtml;
  }

  generateCommentsHtml(comments: any[]): string {
    let commentsHtml = "";
    if (comments == undefined || comments.length == 0)
      commentsHtml += `<p class="text-center comment">Nessun commento</p>`;
    else {
      comments.forEach((comment: any) => {
        commentsHtml += `<div class="text-center">
        <p class="comment"> &nbsp; ${comment}</p>
        </div>
        `;
      });
    }
    return commentsHtml;
  }

  generatePhotosHtmlForEdit(images: any[]): string {
    let imagesHtml = "";
    images.forEach((image: any, index: number) => {
      const cardId = `card-${index}`;
      // Load images
      imagesHtml += `
        <div class="col-md-4">
          <div class="card m-3">
            <img src="${image.url}" class="card-img-top" alt="..." contenteditable="true">
            <div class="card-body">
              <p class="card-title">Immagine fotografata da <b class="${this.checkOperatorDeleted(image.photographer)}">${image.photographer}</b></p>
              <a class="text-decoration-none" data-bs-toggle="collapse" href="#comments-${cardId}" role="button" aria-expanded="false" aria-controls="comments-${cardId}">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-down" viewBox="0 0 16 16">
                  <path d="M7.646 10.646a.5.5 0 0 1 .708 0l4 4a.5.5 0 0 1-.708.708L8 11.707l-3.646 3.647a.5.5 0 1 1-.708-.708l4-4a.5.5 0 0 1 0-.708z"/>
                </svg>
              </a>
              <div class="collapse" id="comments-${cardId}">
                <div class="card card-body text-center" style="font-size: 10pt; vertical-align: middle !important;">
                  ${this.generateCommentsHtmlForEdit(image.comments, index)}
                  </div>
              </div>
            </div>
          </div>
        </div>
      `;
    });
    return imagesHtml;
  }

  generateCommentsHtmlForEdit(comments: any[], index: number): string {
    let commentsHtml = "";
    if (comments == undefined || comments.length == 0)
      commentsHtml += `<p class="text-center comment">Nessun commento</p>`;
    else {
      comments.forEach((comment: any) => {
        commentsHtml += `<div class="text-center m-1">
          <div contenteditable="true" class="comment border" id=${index} role="textbox" aria-multiline="true">${comment}</div>
          </div>
          `;
      });
    }
    return commentsHtml;
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

  setUserInCache(user: any) {
    let cache: any = localStorage.getItem("ASSICURAZIONI");
    if (cache) {
      let parsedCache: any = JSON.parse(cache);
      parsedCache.currentUser = user;
      localStorage.setItem("ASSICURAZIONI", JSON.stringify(parsedCache));
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

  getCoordsFromUrl(indications: string): any {
    const aus = indications.split(',');
    return {
      lat: parseFloat(aus[0]),
      lng: parseFloat(aus[1])
    };
  }

}
