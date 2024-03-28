import { Component, ViewChild } from '@angular/core';
import { HomeService } from '../../services/home.service';
import { MapInfoWindow } from '@angular/google-maps';

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

  @ViewChild("infoWindow") infoWindow!: MapInfoWindow;
  infoContent: string = "";

  constructor(private homeService: HomeService) {

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

    this.homeService.getTest();
    
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

  openInfo(markerElem: any, content: string) {
    this.infoContent = content;
    this.infoWindow.open(markerElem);
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
