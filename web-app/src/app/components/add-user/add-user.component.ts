import { Component } from '@angular/core';
import { UserService } from '../../services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrl: './add-user.component.css'
})
export class AddUserComponent {

  newUser: any = {
    name: "",
    surname: "",
    email: "",
    username: "",
    role: "role",
    city: "",
    gender: "m",
    age: 18,
    createdAt: new Date()
  };

  constructor(private userService: UserService) { }

  onAddUser() {
    Swal.showLoading();
    if (this.validateUser())
      this.userService.addUser(this.newUser);
    else Swal.fire({
      icon: 'error',
      title: 'Errore',
      text: 'Compilare correttamente tutti i campi'
    });
  }

  validateUser(): boolean {
    if (this.newUser.name && this.newUser.surname && this.validateEmail(this.newUser.email)) {
      if (!this.newUser.username)
        this.newUser.username = this.newUser.email.split('@')[0];
      return true;
    }
    return false;
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

}
