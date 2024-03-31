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

  newUser: any = {
    name: "",
    surname: "",
    email: "",
    username: "",
    role: "",
    city: "",
    gender: "",
    age: 0,
    createdAt: new Date()
  };

  constructor(private userService: UserService) { }

  onAddUser() {
    console.log(this.newUser)
    this.userService.addUser(this.newUser);
  }

}
