import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GraphViewComponent } from './graph-view/graph-view.component';
import { StartComponent } from './start/start.component';
import { AuthService } from './auth.service';


const routes: Routes = [
  {path:':world', component:GraphViewComponent, canActivate:[AuthService]},
  {path:'', component:StartComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
