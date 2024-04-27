import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UserPage } from './user.page';

const routes: Routes = [
  {
    path: 'user', component: UserPage,
    children: [
      {
        path: ':id',
        loadChildren: () => import('../manage-user/manage-user.module').then(m => m.ManageUserPageModule)
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
