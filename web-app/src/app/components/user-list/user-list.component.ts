import { Component } from '@angular/core';
import { UserService } from '../../services/user.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css'
})
export class UserListComponent {

  searchText: string = "";
  selectedRole: string = "all";

  constructor(public userService: UserService, private router: Router, private activatedRoute: ActivatedRoute) { }

  async ngOnInit() {
    await this.userService.getUsers();

    this.checkParams();
  }

  async checkParams() {
    this.activatedRoute.params.subscribe(async () => {
      const params = this.activatedRoute.snapshot.queryParams;
      const currentRole = params["role"];

      if (currentRole != undefined && currentRole != "all") {
        this.selectedRole = currentRole;
        this.userService.filterByRole(currentRole);
      } else
        await this.userService.getUsers();
    });
  }

  search() {
    this.userService.searchUser(this.searchText);
  }

  async changeRole() {
    await this.router.navigateByUrl("/users?role=" + this.selectedRole);
    window.location.reload();
  }

  onDeleteUser(id: any) {
    this.userService.deleteUser(id);
  }

}
