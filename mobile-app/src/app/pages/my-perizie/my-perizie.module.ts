import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MyPeriziePageRoutingModule } from './my-perizie-routing.module';

import { MyPeriziePage } from './my-perizie.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MyPeriziePageRoutingModule
  ],
  declarations: [MyPeriziePage]
})
export class MyPeriziePageModule {}
