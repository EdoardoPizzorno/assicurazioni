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
    name: "prova",
    surname: "prova",
    email: "e.pizzorno.2293@vallauri.edu",
    username: "edopiz",
    role: "user",
    city: "Fossano",
    gender: "m",
    age: 0,
    createdAt: new Date()
  };

  constructor(private userService: UserService) { }

  onAddUser() {
    this.userService.addUser(this.newUser);
  }

}
