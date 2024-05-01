import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { HomePage } from './pages/home/home.page';
import { LoginPage } from './pages/login/login.page';
import { UserPage } from './pages/user/user.page';
import { AddPage } from './pages/add/add.page';
import { MyPeriziePage } from './pages/my-perizie/my-perizie.page';
import { ChangePasswordPage } from './pages/change-password/change-password.page';
import { ForgotPasswordPage } from './pages/forgot-password/forgot-password.page';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'login', component: LoginPage },
  { path: 'home', component: HomePage },
  { path: 'perizie', component: MyPeriziePage },
  { path: 'add', component: AddPage },
  { path: 'user', component: UserPage },
  { path: 'change-password', component: ChangePasswordPage },
  { path: 'forgot-password', component: ForgotPasswordPage },
  { path: '**', redirectTo: '' }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
