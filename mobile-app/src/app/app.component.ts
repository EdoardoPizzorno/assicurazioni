import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { LoginService } from './services/login.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  constructor(public platform: Platform, private loginService: LoginService) { }

  async ngOnInit() {
    await this.loginService.checkToken();
  }

}
