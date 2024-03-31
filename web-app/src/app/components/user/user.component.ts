import { Component } from '@angular/core';
import { UserService } from '../../services/user.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrl: './user.component.css'
})
export class UserComponent {

  constructor(public userService: UserService, private router: ActivatedRoute) {
    this.router.params.subscribe((params: any) => {
      this.userService.getUser(params.id);
    });
  }

  back() {
    window.history.back();
  }

}
