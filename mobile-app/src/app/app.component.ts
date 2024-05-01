import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { LoginService } from './services/login.service';
import { UserService } from './services/user.service';
import { PeriziaService } from './services/perizia.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  constructor(public platform: Platform, private loginService: LoginService, private userService: UserService, private periziaService: PeriziaService) { }

  async ngOnInit() {
    await this.loginService.checkToken();
  }

}
