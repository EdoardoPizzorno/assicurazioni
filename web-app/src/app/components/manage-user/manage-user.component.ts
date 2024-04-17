import { Component } from '@angular/core';
import { UserService } from '../../services/user.service';
import Swal from 'sweetalert2';
import { ActivatedRoute } from '@angular/router';
import { RoleService } from '../../services/role.service';

@Component({
  selector: 'app-add-user',
  templateUrl: './manage-user.component.html',
  styleUrl: './manage-user.component.css'
})
export class ManageUserComponent {

  editMode: boolean = false;
  newUser: any = {
    name: "",
    surname: "",
    email: "",
    username: "",
    role: "",
    city: "",
    gender: "m",
    age: 18,
    createdAt: new Date()
  };

  constructor(public userService: UserService, public roleService: RoleService, private router: ActivatedRoute) { }

  async ngOnInit() {
    this.router.params.subscribe((params: any) => {
      if (params.id) {
        this.editMode = true;
        this.userService.getUser(params.id).then(async () => {
          this.newUser = this.userService.selectedUser;
          await this.roleService.getRoles();
        });
      }
    });
  }

  submit() {
    if (this.validateUser()) {
      if (this.editMode)
        this.userService.update(this.newUser);
      else
        this.userService.add(this.newUser);
    }
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
