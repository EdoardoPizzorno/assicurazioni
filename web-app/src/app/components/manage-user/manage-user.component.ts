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

  constructor(public userService: UserService, public roleService: RoleService,
    private router: ActivatedRoute) { }

  async ngOnInit() {
    this.userService.isLoading = false;
    await this.roleService.getRoles();
    this.router.params.subscribe((params: any) => {
      if (params.id) {
        this.editMode = true;
        this.userService.getUser(params.id).then(async () => {
          this.userService.newUser = this.userService.selectedUser;
          await this.roleService.getRoles();
        });
      }
    });
  }

  submit() {
    if (this.validateUser()) {
      if (this.editMode)
        this.userService.update(this.userService.newUser);
      else
        this.userService.add(this.userService.newUser);
    }
    else Swal.fire({
      icon: 'error',
      title: 'Errore',
      text: 'Compilare correttamente tutti i campi'
    });
  }

  validateUser(): boolean {
    if (this.userService.newUser.name && this.userService.newUser.surname && this.validateEmail(this.userService.newUser.email)) {
      if (!this.userService.newUser.username)
        this.userService.newUser.username = this.userService.newUser.email.split('@')[0];
      return true;
    }
    return false;
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  openDialog() {
    Swal.fire({
      title: 'Carica immagine profilo',
      input: 'file',
      inputAttributes:
      {
        accept: 'image/*',
        'aria-label': 'Upload your profile picture'
      },
      showCancelButton: true,
      confirmButtonText: 'Upload',
      cancelButtonText: 'Cancel',
      showLoaderOnConfirm: true,
      preConfirm: (file) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event: any) => {
            this.userService.uploadImageProfile(event.target.result);
            resolve(event.target.result);
          };
          reader.onerror = (event) => {
            reject(new Error('Error uploading image'));
          };
          reader.readAsDataURL(file);
        });
      }
    })
  }

}
