import { Component } from '@angular/core';
import { UserService } from '../../services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { UtilsService } from '../../services/utils/utils.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrl: './user.component.css'
})
export class UserComponent {

  currentId: any;

  constructor(public userService: UserService, public loginService: LoginService, public utils: UtilsService, private activatedRouter: ActivatedRoute, private router: Router) {
    this.activatedRouter.params.subscribe((params: any) => {
      this.currentId = params.id;
      this.userService.getUser(this.currentId);
    });
  }

  edit() {
    this.router.navigateByUrl("user/" + this.currentId + "/edit");
  }

  delete() {
    this.userService.delete(this.currentId);
    this.router.navigate(["/users"]);
  }
  
}
