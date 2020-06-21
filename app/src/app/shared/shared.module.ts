import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MaterialModule } from './material.module';
import { WorldSelectionComponent } from './component/world-selection/world-selection.component';



@NgModule({
  declarations: [WorldSelectionComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,

    MaterialModule
  ],exports:[
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,

    WorldSelectionComponent
  ]
})
export class SharedModule { }
