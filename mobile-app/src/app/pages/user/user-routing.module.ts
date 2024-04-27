import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: 'user',
    children: [
      {
        path: ':id',
        loadChildren: () => import('../user/user.module').then(m => m.UserPageModule)
      },
      {
        path: ':id/edit',
        loadChildren: () => import('../manage-user/manage-user.module').then(m => m.ManageUserPageModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserPageRoutingModule { }
