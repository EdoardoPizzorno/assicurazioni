import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LoginComponent } from './components/login/login.component';
import { UserComponent } from './components/user/user.component';
import { ManageUserComponent } from './components/manage-user/manage-user.component';
import { UserListComponent } from './components/user-list/user-list.component';
import { PerizieTableComponent } from './components/perizie-table/perizie-table.component';
import { RoleComponent } from './components/role/role.component';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'perizie', component: PerizieTableComponent },
  { path: 'roles', component: RoleComponent },
  { path: 'users', component: UserListComponent },
  {
    path: 'user',
    children: [
      { path: 'new', component: ManageUserComponent },
      { path: ':id', component: UserComponent },
      { path: ':id/edit', component: ManageUserComponent }
    ]
  },
  { path: '**', redirectTo: '/dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
