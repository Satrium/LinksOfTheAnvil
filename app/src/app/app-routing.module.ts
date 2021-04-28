import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CardLayoutComponent } from './layout/card-layout/card-layout.component';
import { DefaultLayoutComponent } from './layout/default-layout/default-layout.component';
import { AuthGuard } from '@app/guard/auth.guard';


const routes: Routes = [
  {
    path: '',
    redirectTo: '/auth',
    pathMatch: 'full'
  },
  {
    path:'auth',
    component: CardLayoutComponent,
    loadChildren: () => import('@modules/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path:'share',
    loadChildren: () => import('@modules/share/share.module').then(m => m.ShareModule)
  },
  {
    path:'',
    component: DefaultLayoutComponent,
    canActivate: [AuthGuard],
    children:[
      {
        path:'dashboard',
        loadChildren: () => import('@modules/dashboard/dashboard.module').then(x => x.DashboardModule)
      },{
        path:'explore',
        loadChildren: () => import('@modules/explore/explore.module').then(x => x.ExploreModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
