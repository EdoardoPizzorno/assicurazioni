import { Component, ViewChild } from '@angular/core';
import { PeriziaService } from '../../services/perizia.service';
import { UserService } from '../../services/user.service';
import { GoogleMapsService } from '../../services/google-maps.service';
import { Router } from '@angular/router';

@Component({
  selector: 'home',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

  @ViewChild('map') map: any;

  constructor(public periziaService: PeriziaService, public googleMapsService: GoogleMapsService, private userService: UserService, private router: Router) { }

  async ngOnInit() {
    if (!this.userService.users) {
      await this.userService.getUsers();
    }
    this.googleMapsService.map = this.map;
  }

  async onMarkerClick(coords: any, event: any) {
    if (event.domEvent.shiftKey) {
      await this.router.navigateByUrl('/dashboard?indications=' + coords.lat + ',' + coords.lng
        + "&travelMode=" + this.googleMapsService.travelMode);
      await this.googleMapsService.getDirections();
    }
  }

}
