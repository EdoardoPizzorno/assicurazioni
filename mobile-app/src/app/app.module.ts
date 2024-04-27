import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { ToolbarComponent } from './components/toolbar/toolbar.component';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardPage } from './pages/dashboard/dashboard.page';
import { LoginPage } from './pages/login/login.page';
import { UserPage } from './pages/user/user.page';
import { ManageUserPage } from './pages/manage-user/manage-user.page';

@NgModule({
  declarations: [AppComponent, ToolbarComponent, DashboardPage, LoginPage, UserPage, ManageUserPage],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule { }
