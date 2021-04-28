import { Component,  Input } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';
import { GraphConfig } from '@global/graph.object';
import { NodeColorScheme, LinkColorScheme, ElementVisibility } from '@global/graph.enum';
import { DataService } from '@data/service/data.service';
import { Preset } from '@global/graph.config';
import { SaveConfirmationComponent } from './save-confirmation/save-confirmation.component';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

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

  constructor(private data:DataService, private dialog:MatDialog, private location: Location, private router:Router){}

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
    const dialogRef = this.dialog.open(SaveConfirmationComponent, {data:this.preset});
    dialogRef.afterClosed().subscribe(result => {
      if(result === undefined)return;
      else if(result){
        this.data.updatePreset(this.preset).subscribe((preset) => {
          this.preset = preset;
          this.config$.next(this.preset.config as GraphConfig);
        }, console.error);
      }else{
        this.data.savePreset(this.preset).subscribe((preset) => {
          this.preset = preset;
          this.config$.next(this.preset.config as GraphConfig);          
          this.location.replaceState(this.router.createUrlTree([], {queryParams:{preset:this.preset.id}, queryParamsHandling:"merge"}).toString())
        }, console.error);
      }
    });
  }

  emitConfigChanged(){
    this.config$.next(this.preset.config as GraphConfig);
  }

}
