import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { ToolbarComponent } from './components/toolbar/toolbar.component';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomePage } from './pages/home/home.page';
import { LoginPage } from './pages/login/login.page';
import { UserPage } from './pages/user/user.page';
import { FormsModule } from '@angular/forms';
import { LoaderComponent } from './components/loader/loader.component';
import { AddPage } from './pages/add/add.page';
import { SaveButtonComponent } from './components/save-button/save-button.component';
import { DeleteButtonComponent } from './components/delete-button/delete-button.component';
import { GoogleMapsModule } from '@angular/google-maps';
import { PerizieTableComponent } from './components/perizie-table/perizie-table.component';
import { TravelModesComponent } from './components/travel-modes/travel-modes.component';
import { MyPeriziePage } from './pages/my-perizie/my-perizie.page';
import { ForgotPasswordPage } from './pages/forgot-password/forgot-password.page';
import { ChangePasswordPage } from './pages/change-password/change-password.page';
import { GenerateButtonComponent } from './components/generate-button/generate-button.component';

@NgModule({
  declarations: [AppComponent, ToolbarComponent, LoaderComponent, SaveButtonComponent, DeleteButtonComponent,
    PerizieTableComponent, TravelModesComponent, GenerateButtonComponent,
    ChangePasswordPage, ForgotPasswordPage,
    HomePage, LoginPage, UserPage, AddPage, MyPeriziePage],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, FormsModule, GoogleMapsModule],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule { }
