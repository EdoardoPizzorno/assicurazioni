import { Component } from '@angular/core';
import { UserService } from '../../services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { RoleService } from '../../services/role.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css'
})
export class UserListComponent {

  searchText: string = "";
  selectedRole: string = "all";

  constructor(public userService: UserService, public roleService: RoleService, private router: Router, private activatedRoute: ActivatedRoute) { }

  async ngOnInit() {
    await this.userService.getUsers();
  }

  async search() {
    await this.router.navigateByUrl("/users?search=" + this.searchText);
    this.userService.getUsers();
    this.selectedRole = "all";
  }

  async filterByRole() {
    await this.router.navigateByUrl("/users?role=" + this.selectedRole);
    this.userService.getUsers();
    this.searchText = "";
  }

  deleteUser(id: any) {
    this.userService.delete(id);
  }

}
