import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { FormsModule } from '@angular/forms';
import { LoginComponent } from './components/login/login.component';
import { GoogleMapsModule } from '@angular/google-maps';
import { UserComponent } from './components/user/user.component';
import { ManageUserComponent } from './components/manage-user/manage-user.component';
import { UserListComponent } from './components/user-list/user-list.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { PerizieTableComponent } from './components/perizie-table/perizie-table.component';
import { RoleComponent } from './components/role/role.component';
import { LoaderComponent } from './components/loader/loader.component';
import { TravelModesComponent } from './components/travel-modes/travel-modes.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    LoginComponent,
    UserComponent,
    ManageUserComponent,
    UserListComponent,
    HeaderComponent,
    FooterComponent,
    PerizieTableComponent,
    RoleComponent,
    LoaderComponent,
    TravelModesComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    GoogleMapsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
