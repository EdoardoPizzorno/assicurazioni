import { Component } from '@angular/core';
import { HomeService } from '../../services/home.service';

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  constructor(private homeService: HomeService) {
    
    let token = localStorage.getItem("ASSICURAZIONI_TOKEN");
    if (!token || token === "undefined") {
      window.location.href = "/login";
    }

  }

  ngOnInit(): void {
    this.homeService.getTest();
  }

  display: any;
  center: google.maps.LatLngLiteral = {
    lat: 22.2736308,
    lng: 70.7512555
  };
  zoom = 6;

  moveMap(event: google.maps.MapMouseEvent) {
    if (event.latLng != null) this.center = (event.latLng.toJSON());
  }

  move(event: google.maps.MapMouseEvent) {
    if (event.latLng != null) this.display = event.latLng.toJSON();
  }

}
