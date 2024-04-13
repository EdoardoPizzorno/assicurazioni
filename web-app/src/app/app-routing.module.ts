import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LoginComponent } from './components/login/login.component';
import { UserComponent } from './components/user/user.component';
import { AddUserComponent } from './components/add-user/add-user.component';
import { UserListComponent } from './components/user-list/user-list.component';
import { EditUserComponent } from './components/edit-user/edit-user.component';

const routes: Routes = [
  { path: '', redirectTo: '/perizie', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'perizie', component: DashboardComponent },
  { path: 'users', component: UserListComponent },
  {
    path: 'user',
    children: [
      { path: 'new', component: AddUserComponent },
      { path: ':id', component: UserComponent },
      { path: ':id/edit', component: EditUserComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
