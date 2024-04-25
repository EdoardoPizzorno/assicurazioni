import { Component, ViewChild } from '@angular/core';
import { PeriziaService } from '../../services/perizia.service';
import { UserService } from '../../services/user.service';
import { GoogleMapsService } from '../../services/google-maps.service';

@Component({
  selector: 'home',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

  @ViewChild('map') map: any;

  constructor(public periziaService: PeriziaService, public googleMapsService: GoogleMapsService, private userService: UserService) { }

  async ngOnInit() {
    await this.userService.getUsers();
    this.googleMapsService.map = this.map;
  }

}
