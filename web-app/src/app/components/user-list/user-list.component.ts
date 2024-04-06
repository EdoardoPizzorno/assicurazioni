import { Component } from '@angular/core';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css'
})
export class UserListComponent {

  searchText: string = "";
  roleFilter: string = "all";

  constructor(public userService: UserService) {
    userService.getUsers();
  }

  search() {
    this.userService.searchUser(this.searchText);
  }

  filterByRole() {
    this.userService.filterByRole(this.roleFilter);
  }

}
