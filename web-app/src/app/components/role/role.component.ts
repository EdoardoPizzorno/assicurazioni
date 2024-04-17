import { Component } from '@angular/core';
import { RoleService } from '../../services/role.service';

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

  addRole() {
    this.roleService.add();
  }

  editRole(role: any) {
    this.roleService.update(role);
  }

  deleteRole(role: any) {
    this.roleService.delete(role._id);
  }

}
