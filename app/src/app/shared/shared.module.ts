import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MaterialModule } from './material.module';
import { SelectionComponent } from './components/selection/selection.component';
import { PresetSelectionComponent } from './components/selection/preset-selection/preset-selection.component';
import { SelectionButtonsDirective } from './components/selection/selection-buttons.directive';
import { WorldSelectionComponent } from './components/selection/world-selection/world-selection.component';


@NgModule({
  declarations: [
    WorldSelectionComponent, 
    SelectionComponent, 
    PresetSelectionComponent, 
    SelectionButtonsDirective],
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

    WorldSelectionComponent,
    SelectionComponent,
    PresetSelectionComponent, 
    SelectionButtonsDirective
  ], entryComponents:[SelectionComponent]
})
export class SharedModule { }
