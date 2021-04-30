import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DataService } from '@data/service/data.service';
import { Preset } from '@global/graph.config';
import { World } from '@global/worldanvil/world';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface PreSelection{
  world: World;
  preset: Preset;
}

@Component({
  selector: 'app-selection',
  templateUrl: './selection.component.html',
  styleUrls: ['./selection.component.sass']
})
export class SelectionComponent implements OnInit {

  worlds$:Observable<World[]>;
  presets$:Observable<Preset[]>;

  constructor(public dialogRef: MatDialogRef<SelectionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PreSelection, private dataService:DataService) { }

  ngOnInit(): void {
    this.worlds$ = this.dataService.getWorlds().pipe(map(x => x.worlds));
    this.presets$ = this.dataService.getPresets();
  }

  private checkReturn(){
    if(this.data.world && this.data.preset){
      this.dialogRef.close(this.data);
    }
  }

  selectWorld(world){
    this.data.world = world;
    this.checkReturn();
  }

  selectPreset(preset){
    this.data.preset = preset;
    this.checkReturn();
  }
}
