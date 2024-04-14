import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PerizieComponent } from './components/dashboard/perizie.component';
import { LoginComponent } from './components/login/login.component';
import { UserComponent } from './components/user/user.component';
import { ManageUserComponent } from './components/manage-user/manage-user.component';
import { UserListComponent } from './components/user-list/user-list.component';

const routes: Routes = [
  { path: '', redirectTo: '/perizie', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'perizie', component: PerizieComponent },
  { path: 'users', component: UserListComponent },
  {
    path: 'user',
    children: [
      { path: 'new', component: ManageUserComponent },
      { path: ':id', component: UserComponent },
      { path: ':id/edit', component: ManageUserComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
