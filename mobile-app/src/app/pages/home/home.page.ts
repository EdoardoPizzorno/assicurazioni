import { Component, ViewChild } from '@angular/core';
import { GoogleMapsService } from 'src/app/services/google-maps.service';
import { PeriziaService } from 'src/app/services/perizia.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage {

  @ViewChild('map') map: any;

  constructor(public userService: UserService, public periziaService: PeriziaService, public googleMapsService: GoogleMapsService) { }

  async ngOnInit() {
    if (this.userService.currentUser) {
      await this.userService.getUser();
      await this.periziaService.getPerizie();
    }
  }

}
