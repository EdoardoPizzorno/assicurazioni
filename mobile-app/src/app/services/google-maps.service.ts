import { Injectable } from '@angular/core';
import { GoogleMap } from '@angular/google-maps';
import { PeriziaService } from './perizia.service';
import { ActivatedRoute } from '@angular/router';
import { UtilsService } from './utils/utils.service';
import { UserService } from './user.service';
import { Geolocation } from '@capacitor/geolocation';
import { Title } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class GoogleMapsService {

  position: any = {
    coords: {
      lat: 44.5558401,
      lng: 7.7358973
    },
    title: "Tu sei qui!"
  };


  map!: GoogleMap;
  mapOptions: google.maps.MapOptions = {
    mapTypeId: 'roadmap', //roadmap, satellite, hybrid, terrain
    disableDoubleClickZoom: true,
    maxZoom: 15,
    minZoom: 8,
    mapTypeControl: true,
    mapTypeControlOptions: {
      mapTypeIds: ['roadmap', 'satellite', 'hybrid', 'terrain'],
    },
  };
  travelMode: string = 'DRIVING';
  mapCenter: any = this.position.coords;
  display: any;
  zoom: number = 12;
  markerOptions: google.maps.MarkerOptions = {
    draggable: false,
    animation: google.maps.Animation.DROP
  };

  constructor(private periziaService: PeriziaService, private utils: UtilsService, private activatedRoute: ActivatedRoute, private userService: UserService) {
    this.getCurrentLocation();
  }

  async getCurrentLocation() {
    const coordinates = await Geolocation.getCurrentPosition();
    this.position.coords = {
      lat: coordinates.coords.latitude,
      lng: coordinates.coords.longitude
    };
    this.mapCenter = this.position.coords;
  }

  async getDirections() {
    const destination = this.utils.getCoordsFromUrl(this.activatedRoute.snapshot.queryParams["indications"]);
    if (destination) {
      const directionsService = new google.maps.DirectionsService();
      const directionsRenderer = new google.maps.DirectionsRenderer();
      const sideBar: HTMLElement = document.getElementById("sidebar") as HTMLElement;

      this.periziaService.selectedPeriziaId = this.getIdFromCoords(destination);

      sideBar.innerHTML = '';

      this.map.panTo(destination);
      directionsRenderer.setMap(this.map.googleMap!);
      directionsRenderer.setPanel(null);
      directionsRenderer.setPanel(sideBar);

      const request: google.maps.DirectionsRequest = {
        origin: this.position.coords,
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
    this.travelMode = this.activatedRoute.snapshot.queryParams["travelMode"] || "DRIVING";
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

  getIdFromCoords(coords: any): string {
    for (let perizia of this.periziaService.perizie) {
      if (perizia.coords.lat == coords.lat && perizia.coords.lng == coords.lng) {
        return perizia._id;
      }
    }
    return "";
  }

}
