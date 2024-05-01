import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginService } from 'src/app/services/login.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.page.html',
  styleUrls: ['./user.page.scss'],
})
export class UserPage implements OnInit {

  constructor(public userService: UserService, public loginService: LoginService, private router: Router) { }

  async ngOnInit() {
    if (!this.userService.currentUser) {
      await this.userService.getUser();
    }
  }

  edit() {
    this.router.navigateByUrl("user/edit");
  }

}
