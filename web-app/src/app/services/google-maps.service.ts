import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class GoogleMapsService {

  isLoading: boolean = false;

  headQuarter: any = {
    coords: {
      lat: 44.5558401,
      lng: 7.7358973
    }
  }
  mapCenter: any = this.headQuarter.coords;
  display: any;
  zoom: number = 12;
  markerOptions: google.maps.MarkerOptions = { draggable: false, animation: google.maps.Animation.DROP };

  constructor() {
    this.getCurrentLocation();
  }

  getCurrentLocation() {
    this.isLoading = true;
    navigator.geolocation.getCurrentPosition(
      (position: GeolocationPosition) => {
        const point: google.maps.LatLngLiteral = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        this.headQuarter.coords = point;
        this.mapCenter = new google.maps.LatLng(point);
      });
    this.isLoading = false;
  }

  getDirections(map: any, destination: google.maps.LatLngLiteral) {
    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer();

    map.panTo(destination);
    directionsRenderer.setMap(map.googleMap);

    const request: google.maps.DirectionsRequest = {
      origin: this.headQuarter.coords,
      destination: destination,
      travelMode: google.maps.TravelMode.DRIVING,
      provideRouteAlternatives: true
    };

    directionsService.route(request, (result, status) => {
      if (status === google.maps.DirectionsStatus.OK) {
        directionsRenderer.setDirections(result);
      } else {
        console.error('Errore durante il calcolo del percorso:', status);
      }
    });
  }

  moveMap(event: google.maps.MapMouseEvent) {
    if (event.latLng != null)
      this.mapCenter = event.latLng.toJSON();
  }

  move(event: google.maps.MapMouseEvent) {
    if (event.latLng != null)
      this.display = event.latLng.toJSON();
  }

  drag() {
    console.log("Marker dragged");
    this.markerOptions.animation = google.maps.Animation.BOUNCE;
    this.markerOptions.draggable = true;
  }

}
