import { Component, ViewChild } from '@angular/core';
import { HomeService } from '../../services/home.service';
import { MapInfoWindow, MapMarker } from '@angular/google-maps';

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  display: any;
  center: google.maps.LatLngLiteral;
  zoom: number;

  markers: any[] = [];
  @ViewChild(MapMarker, { static: false }) markerElem!: MapMarker;

  @ViewChild(MapInfoWindow, { static: false }) infoWindow!: MapInfoWindow;

  constructor(public homeService: HomeService) {

    this.checkToken();

    // Set map
    this.center = this.homeService.headQuarter;
    this.zoom = 12;

    // Add headquarter marker
    this.markers.push({
      position: this.homeService.headQuarter,
      title: "HEADQUARTER",
      info: "Descrizione Headquarter"
    });

    // Get Perizie
    this.homeService.getPerizie();

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

  openInfo() {
    this.infoWindow.open(this.markerElem);
  }

  //#endregion

  //#region AUTHORIZATION

  checkToken() {
    let token = localStorage.getItem("ASSICURAZIONI_TOKEN");
    if (!token || token === "undefined") {
      window.location.href = "/login";
    }
  }

  //#endregion

}
