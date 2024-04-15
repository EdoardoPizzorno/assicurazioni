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
    await this.roleService.getRoles();
  }

  addRole() {
    this.roleService.addRole();
  }

}
