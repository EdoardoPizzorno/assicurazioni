import { Component } from '@angular/core';
import { PeriziaService } from '../../services/perizia.service';
import { UserService } from '../../services/user.service';
import { RoleService } from '../../services/role.service';

@Component({
  selector: 'home',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

  display: any;
  center: google.maps.LatLngLiteral;
  zoom: number;

  markerOptions: google.maps.MarkerOptions = { draggable: false, animation: google.maps.Animation.DROP };
  icon: string = "https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png"

  constructor(public periziaService: PeriziaService, private userService: UserService, private roleService: RoleService) {
    // Set map
    this.center = this.periziaService.headQuarter.coords;
    this.zoom = 12;
  }

  async ngOnInit() {
    await this.periziaService.getPerizie();
    await this.userService.getUsers();
    await this.roleService.getRoles();
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

  drag() {
    console.log("Marker dragged");
    this.markerOptions.animation = google.maps.Animation.BOUNCE;
    this.markerOptions.draggable = true;
  }

  //#endregion
}
