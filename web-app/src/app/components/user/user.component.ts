import { Component } from '@angular/core';
import { UserService } from '../../services/user.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrl: './user.component.css'
})
export class UserComponent {

  currentId: any;

  constructor(public userService: UserService, private activatedRouter: ActivatedRoute, private router: Router) {
    this.activatedRouter.params.subscribe((params: any) => {
      this.currentId = params.id;
      this.userService.getUser(this.currentId);
    });
  }

  edit() {
    this.router.navigateByUrl("user/" + this.currentId + "/edit");
  }

  delete() {
    this.userService.deleteUser(this.currentId);
    this.router.navigate(["/users"]);
  }

  back() {
    this.router.navigate(["/users"]);
  }

}
