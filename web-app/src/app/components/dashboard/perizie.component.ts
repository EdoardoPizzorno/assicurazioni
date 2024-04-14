import { Component } from '@angular/core';
import { PeriziaService } from '../../services/perizia.service';
import Swal from 'sweetalert2';
import { UserService } from '../../services/user.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'home',
  templateUrl: './perizie.component.html',
  styleUrl: './perizie.component.css'
})
export class PerizieComponent {

  display: any;
  center: google.maps.LatLngLiteral;
  zoom: number;

  markerOptions: google.maps.MarkerOptions = { draggable: false, animation: google.maps.Animation.DROP };
  icon: string = "https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png"

  selectedOperator: string = "all";

  constructor(public periziaService: PeriziaService, private userService: UserService, private activatedRoute: ActivatedRoute, private router: Router) {
    // Set map
    this.center = this.periziaService.headQuarter.coords;
    this.zoom = 12;
  }

  async ngOnInit() {
    this.periziaService.getPerizie();
  }

  async filterByOperator() {
    await this.router.navigateByUrl("/perizie?operator=" + this.selectedOperator);
    this.periziaService.getPerizie();
  }

  //#region MAP & MARKERS EVENTS

  moveMap(event: google.maps.MapMouseEvent) {
    if (event.latLng != null)
      this.center = (event.latLng.toJSON());
  }

  move(event: google.maps.MapMouseEvent) {
    if (event.latLng != null)
      this.display = event.latLng.toJSON();
  }

  openInfo(perizia: any) {
    let imagesHtml = this.generatePhotosHtml(perizia.photos);

    Swal.fire({
      title: perizia.description,
      html: `
        <b>Data:</b> ${perizia.date} alle ${perizia.time}<br>
        <b>Descrizione:</b> ${perizia.description}<br>
        <b>Creata da:</b> <span class="${this.checkOperatorDeleted(perizia.operator.username)}"> ${perizia.operator.username} </span> <br>
        <div class="row container">
          ${imagesHtml}
        </div>
      `,
      width: "60%",
    });

  }

  drag() {
    console.log("Marker dragged");
    this.markerOptions.animation = google.maps.Animation.BOUNCE;
    this.markerOptions.draggable = true;
  }

  //#endregion

  //#region UTILS

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

  checkOperatorDeleted(operator: string) {
    if (operator == undefined)
      return "";
    return operator == "Utente eliminato" ? "deleted" : "";
  }

  //#endregion

}
