import { Component } from '@angular/core';
import { RoleService } from '../../services/role.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrl: './role.component.css'
})
export class RoleComponent {

  constructor(public roleService: RoleService) { }

  async ngOnInit() {
    if (!this.roleService.roles)
      await this.roleService.getRoles();
  }

  updateName(role: any) {
    Swal.fire({
      title: 'Modifica ruolo',
      input: 'text',
      inputValue: role.name,
      showCancelButton: true,
      confirmButtonText: 'Update',
      showLoaderOnConfirm: true,

    }).then((response: any) => {
      if (response.isConfirmed) {
        role.name = response.value;
        this.roleService.update(role);
      }

    })
  }

  updateAccess(role: any) {
    role.canAccessToWebApp = !role.canAccessToWebApp;
    this.roleService.update(role);
  }

}
