import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
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

  constructor(public userService: UserService, public periziaService: PeriziaService, public googleMapsService: GoogleMapsService, private alertController: AlertController, private router: Router) { }

  async ngOnInit() {
    if (!this.userService.currentUser) {
      await this.userService.getUser();
      await this.periziaService.getPerizie();
      this.googleMapsService.map = this.map;
      await this.googleMapsService.getDirections();
      // Check if the user is logging in for the first time or first time after forgot password
      if (this.userService.currentUser.firstLogin) {
        this.alertController.create({
          header: 'Benvenuto ' + this.userService.currentUser.username + '!',
          message: 'Ti consigliamo di cambiare la password',
          buttons: ['OK']
        }).then((alert) => {
          alert.present();
          this.router.navigateByUrl('/change-password');
        });
      }
    }
  }

}
