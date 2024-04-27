import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ManageUserPage } from './manage-user.page';

const routes: Routes = [
  {
    path: '',
    component: ManageUserPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ManageUserPageRoutingModule {}
