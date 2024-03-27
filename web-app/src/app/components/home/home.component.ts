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

  constructor(private homeService: HomeService) {
    this.checkToken();
    // Set map
    this.center = this.homeService.headQuarter;
    this.zoom = 12;
    // Add headquarter marker
    this.markers.push({
      position: this.homeService.headQuarter,
      title: "HEADQUARTER",
    });
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

  addMarker() {
    this.markers.push({
      position: {
        lat: this.center.lat + ((Math.random() - 0.5) * 2) / 10,
        lng: this.center.lng + ((Math.random() - 0.5) * 2) / 10,
      },
      label: {
        color: 'red',
        text: 'Marker label ' + (this.markers.length + 1),
      },
      title: 'Marker title ' + (this.markers.length + 1)
    });
  }



  //#endregion

  //#region AUTHORITAZION

  checkToken() {
    let token = localStorage.getItem("ASSICURAZIONI_TOKEN");
    if (!token || token === "undefined") {
      window.location.href = "/login";
    }
  }

  //#endregion

}
