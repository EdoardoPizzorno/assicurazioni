import { Component } from '@angular/core';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrl: './add-user.component.css'
})
export class AddUserComponent {

  name: string = "";
  surname: string = "";
  email: string = "";

  constructor(private userService: UserService) {}

  onAddUser() {
    const newUser: any = {
      name: this.name,
      surname: this.surname,
      email: this.email
    };
    this.userService.addUser(newUser);
  }

}
