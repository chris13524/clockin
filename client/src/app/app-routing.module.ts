import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {MainComponent} from "./main/main.component";
import {NotFoundComponent} from "./notFound/notFound.component";
import {HomeComponent} from "./main/home/home.component";
import {DashboardComponent} from "./main/dashboard/dashboard.component";

const routes: Routes = [{
  path: "", component: MainComponent, children: [
    {path: "", component: HomeComponent},
    {path: "dashboard", component: DashboardComponent}
  ]
},
  {path: "**", component: NotFoundComponent},];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
