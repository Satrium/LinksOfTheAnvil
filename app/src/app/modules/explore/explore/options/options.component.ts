import { Component,  Input } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';
import { GraphConfig } from '@global/graph.object';
import { NodeColorScheme, LinkColorScheme, ElementVisibility } from '@global/graph.enum';
import { DataService } from '@data/service/data.service';
import { Preset } from '@global/graph.config';

@Component({
  selector: 'app-graph-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.sass'],
})
export class OptionsComponent{

  NodeColorScheme = NodeColorScheme;
  LinkColorScheme = LinkColorScheme;
  ElementVisibility = ElementVisibility;

  @Input() config$: BehaviorSubject<GraphConfig>;
  @Input() preset: Preset;

  constructor(private data:DataService){}

  selectedTab = 0;

  keys(object, front:boolean){
    let keys = Object.keys(object).sort();
    let halfLength = Math.ceil(keys.length / 2);
    if(front){
      return keys.splice(0, halfLength)
    }else{
      return keys.splice(halfLength, keys.length);
    }
  }

  savePreset(){
    this.data.savePreset(this.preset).subscribe(console.log, console.error);
  }

  emitConfigChanged(){
    this.config$.next(this.preset.config as GraphConfig);
  }

}
