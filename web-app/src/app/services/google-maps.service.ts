import { Injectable } from '@angular/core';
import { GoogleMap } from '@angular/google-maps';

@Injectable({
  providedIn: 'root'
})
export class GoogleMapsService {
  headQuarter: any = {
    coords: {
      lat: 44.5558401,
      lng: 7.7358973
    }
  }

  map!: GoogleMap;
  mapOptions: google.maps.MapOptions = {
    mapTypeId: 'roadmap', //roadmap, satellite, hybrid, terrain
    scrollwheel: false,
    disableDoubleClickZoom: true,
    maxZoom: 15,
    minZoom: 8,
    mapTypeControlOptions: {
      mapTypeIds: ['roadmap', 'satellite', 'hybrid', 'terrain'],
    },
  };
  travelMode: string = 'DRIVING';
  mapCenter: any = this.headQuarter.coords;
  display: any;
  zoom: number = 12;
  markerOptions: google.maps.MarkerOptions = {
    draggable: false,
    animation: google.maps.Animation.DROP
  };

  constructor() {
    this.getCurrentLocation();
  }

  getCurrentLocation() {
    navigator.geolocation.getCurrentPosition(
      (position: GeolocationPosition) => {
        const point: google.maps.LatLngLiteral = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        this.headQuarter.coords = point;
        this.mapCenter = new google.maps.LatLng(point);
      });
  }

  getDirections(destination: google.maps.LatLngLiteral, event: any) {
    if (event instanceof PointerEvent || ("domEvent" in event && event.domEvent.shiftKey)) { // Click from table or Shift + Click
      const directionsService = new google.maps.DirectionsService();
      const directionsRenderer = new google.maps.DirectionsRenderer();

      this.map.panTo(destination);
      directionsRenderer.setMap(this.map.googleMap!);

      const request: google.maps.DirectionsRequest = {
        origin: this.headQuarter.coords,
        destination: destination,
        travelMode: this.getTravelMode(directionsRenderer), // BICYCLING, DRIVING, TRANSIT, WALKING
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
  }

  getTravelMode(directionsRenderer: google.maps.DirectionsRenderer): google.maps.TravelMode {
    let travelMode: google.maps.TravelMode = google.maps.TravelMode.DRIVING;
    if (this.travelMode == "DRIVING") {
      travelMode = google.maps.TravelMode.DRIVING;
      directionsRenderer.setOptions({
        polylineOptions: {
          strokeColor: 'green',
          strokeOpacity: 0.5,
          strokeWeight: 6
        }
      });
    }
    if (this.travelMode == "WALKING") {
      travelMode = google.maps.TravelMode.WALKING;
      directionsRenderer.setOptions({
        polylineOptions: {
          strokeColor: 'blue',
          strokeOpacity: 0.5,
          strokeWeight: 6
        }
      });
    }
    if (this.travelMode == "BICYCLING") {
      travelMode = google.maps.TravelMode.BICYCLING;
      directionsRenderer.setOptions({
        polylineOptions: {
          strokeColor: 'red',
          strokeOpacity: 0.5,
          strokeWeight: 6
        }
      });
    }
    if (this.travelMode == "TRANSIT") {
      travelMode = google.maps.TravelMode.TRANSIT;
      directionsRenderer.setOptions({
        polylineOptions: {
          strokeColor: 'purple',
          strokeOpacity: 0.5,
          strokeWeight: 6
        }
      });
    }
    return travelMode;
  }

}
