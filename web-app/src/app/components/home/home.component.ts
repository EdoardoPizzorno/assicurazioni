import { Component, ViewChild } from '@angular/core';
import { HomeService } from '../../services/home.service';
import { MapInfoWindow, MapMarker } from '@angular/google-maps';
import { LoginService } from '../../services/login.service';

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
  @ViewChild(MapInfoWindow) infoWindow!: MapInfoWindow;

  constructor(public homeService: HomeService, private loginService: LoginService) {

    this.loginService.checkToken();

    // Set map
    this.center = this.homeService.headQuarter;
    this.zoom = 12;

    // Add headquarter marker
    this.markers.push({
      position: this.homeService.headQuarter,
      title: "HEADQUARTER",
      info: "Descrizione Headquarter"
    });

  }

  async ngOnInit() {
    // Get Perizie
    await this.homeService.getPerizie();
    // Load markers
    for (let perizia of this.homeService.perizie) {
      this.markers.push({
        position: perizia.coords,
        title: perizia.description,
        info: perizia.description
      })
    }
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

  openInfo(marker: any) {
    console.log(marker)
    this.infoWindow.open(marker);
  }

  //#endregion

}
