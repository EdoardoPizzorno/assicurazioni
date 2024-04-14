import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PerizieComponent } from './components/dashboard/perizie.component';
import { FormsModule } from '@angular/forms';
import { LoginComponent } from './components/login/login.component';
import { GoogleMapsModule } from '@angular/google-maps';
import { DecimalPipe } from '@angular/common';
import { UserComponent } from './components/user/user.component';
import { ManageUserComponent } from './components/manage-user/manage-user.component';
import { UserListComponent } from './components/user-list/user-list.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';

@NgModule({
  declarations: [
    AppComponent,
    PerizieComponent,
    LoginComponent,
    UserComponent,
    ManageUserComponent,
    UserListComponent,
    HeaderComponent,
    FooterComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    GoogleMapsModule,
  ],
  providers: [DecimalPipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
