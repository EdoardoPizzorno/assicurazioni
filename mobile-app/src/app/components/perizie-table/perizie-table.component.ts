import { Component } from '@angular/core';
import { PeriziaService } from '../../services/perizia.service';
import { Router } from '@angular/router';
import { UtilsService } from '../../services/utils/utils.service';
import { LoginService } from '../../services/login.service';
import { GoogleMapsService } from '../../services/google-maps.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'perizie-table',
  templateUrl: './perizie-table.component.html',
  styleUrl: './perizie-table.component.css'
})
export class PerizieTableComponent {

  selectedDescription: string = "";
  selectedDate: string = "";

  constructor(private userService: UserService, public periziaService: PeriziaService, public loginService: LoginService, public googleMapsService: GoogleMapsService, private router: Router, private utils: UtilsService) { }

  async ngOnInit() {
    this.selectedDate = this.router.parseUrl(this.router.url).queryParams["date"] || "";
    this.selectedDescription = this.router.parseUrl(this.router.url).queryParams["search"] || "";
    if (!this.userService.currentUser) {
      await this.userService.getUser();
    }
    if (!this.periziaService.perizie) {
      await this.periziaService.getPerizie();
    }
  }

  async filter() {
    let url = this.utils.createUrl(this.selectedDate, this.selectedDescription)
    await this.router.navigateByUrl(url);
    await this.periziaService.getPerizie();
  }

  async removeFilter(filterType: string) {
    if (filterType === "date") {
      this.selectedDate = "";
    } else if (filterType === "description") {
      this.selectedDescription = "";
    } else if (filterType === "indications") {
      await this.router.navigateByUrl('/home');
      window.location.reload();
    }

    const url = this.utils.createUrl(this.selectedDate, this.selectedDescription);
    await this.router.navigateByUrl(url);
    await this.periziaService.getPerizie();
  }

  async loadIndications(coords: any) {
    await this.router.navigateByUrl('/home?indications=' + coords.lat + ',' + coords.lng
      + "&travelMode=" + this.googleMapsService.travelMode);
    await this.googleMapsService.getDirections();
    window.location.reload();
  }

}
