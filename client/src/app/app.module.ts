import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {MainComponent} from "./main/main.component";
import {NotFoundComponent} from "./notFound/notFound.component";
import {HomeComponent} from "./main/home/home.component";
import {CommonModule} from "@angular/common";
import {HttpClientModule} from "@angular/common/http";
import {FormsModule} from "@angular/forms";
import {DashboardComponent} from "./main/dashboard/dashboard.component";

@NgModule({
  declarations: [
    AppComponent,
    NotFoundComponent,
    MainComponent,
    HomeComponent,
    DashboardComponent
  ],
  imports: [BrowserModule.withServerTransition({appId: 'clockin'}),
    CommonModule,
    HttpClientModule,
    FormsModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
