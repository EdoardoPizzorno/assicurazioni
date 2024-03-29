import { Component } from '@angular/core';
import { HomeService } from '../../services/home.service';
import { LoginService } from '../../services/login.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  display: any;
  center: google.maps.LatLngLiteral;
  zoom: number;

  constructor(public homeService: HomeService, private loginService: LoginService) {

    this.loginService.checkToken();

    // Set map
    this.center = this.homeService.headQuarter;
    this.zoom = 12;

  }

  async ngOnInit() {
    // Get Perizie
    await this.homeService.getPerizie();
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
    let imagesHtml = '';
    perizia.photos.forEach((image: any) => {
      // Load images
      imagesHtml += `
      <div style="display: inline-block; border: 1px solid gray; border-radius: 5px">
        <img src="${image.url}" alt="Image" style="width: 100px; height: 75px">
      </div>
      `;
    });


    Swal.fire({
      title: perizia.description,
      html: `
        <b>Data:</b> ${perizia.date} - ${perizia.time}<br>
        <b>Descrizione:</b> ${perizia.description}<br>
        <br>
        <div>
          ${imagesHtml}
        </div>
      `,
      imageUrl: perizia.immagine,
      imageWidth: 400,
      imageHeight: 200,
      imageAlt: 'Custom image',
    });
  }

  //#endregion

}
