import { Component, OnInit, Inject, Input } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable, BehaviorSubject } from 'rxjs';
import { GraphConfig } from '@global/graph.object';
import { NodeColorScheme, LinkColorScheme, ElementVisibility } from '@global/graph.enum';

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
  @Input() config: GraphConfig;

  selectedTab = 0;

  constructor() {
  }

  keys(object, front:boolean){
    let keys = Object.keys(object).sort();
    let halfLength = Math.ceil(keys.length / 2);
    if(front){
      return keys.splice(0, halfLength)
    }else{
      return keys.splice(halfLength, keys.length);
    }
  }

}
