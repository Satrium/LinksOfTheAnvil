import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { CoreModule } from '@app/core.module';
import { SharedModule } from '@shared/shared.module';
import { CardLayoutComponent } from './layout/card-layout/card-layout.component';
import { DefaultLayoutComponent } from './layout/default-layout/default-layout.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';



@NgModule({
  declarations: [
    AppComponent,
    CardLayoutComponent,
    DefaultLayoutComponent,
    SidebarComponent
  ],
  imports: [
    BrowserModule,    
    BrowserAnimationsModule,
    
    CoreModule,
    SharedModule,

    AppRoutingModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
