import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardPage } from './dashboard.page';

const routes: Routes = [
  { path: 'dashboard', component: DashboardPage,
    children: [
      { path: 'tab1', loadChildren: () => import('../tab1/tab1.module').then(m => m.Tab1PageModule) },
      { path: 'tab2', loadChildren: () => import('../tab2/tab2.module').then(m => m.Tab2PageModule) },
      { path: 'tab3', loadChildren: () => import('../tab3/tab3.module').then(m => m.Tab3PageModule) },
      { path: '', redirectTo: '/dashboard/tab1', pathMatch: 'full' }
    ]
   },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class DashboardPageRoutingModule { }
