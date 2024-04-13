import { Component } from '@angular/core';
import { PeriziaService } from '../../services/perizia.service';
import Swal from 'sweetalert2';
import { UserService } from '../../services/user.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'home',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

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
        <b>Data:</b> ${perizia.date} alle ${perizia.time}<br>
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

  drag() {
    console.log("Marker dragged");
    this.markerOptions.animation = google.maps.Animation.BOUNCE;
    this.markerOptions.draggable = true;
  }

  //#endregion

}
