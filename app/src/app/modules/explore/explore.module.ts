import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { GraphModule } from '@modules/graph/graph.module';
import { ExploreSelectComponent } from './explore-select/explore-select.component';
import { ExploreComponent } from './explore/explore.component';
import { OptionsComponent } from './explore/options/options.component';
import { SaveConfirmationComponent } from './explore/options/save-confirmation/save-confirmation.component';
import { MatDialogModule } from '@angular/material/dialog';

const routes: Routes = [
  {path: '', component: ExploreSelectComponent},
  {path: ':world', component: ExploreComponent}
];

@NgModule({
  declarations: [ExploreSelectComponent, ExploreComponent, OptionsComponent, SaveConfirmationComponent],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes),
    GraphModule,
    MatDialogModule
  ],entryComponents:[SaveConfirmationComponent]
})
export class ExploreModule { }
