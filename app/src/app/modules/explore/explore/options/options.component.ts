import { Component, OnInit, Inject, Input } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable, BehaviorSubject } from 'rxjs';
import { GraphConfig } from '@modules/graph/graph.object';
import { NodeColorScheme, LinkColorScheme, Visibility } from '@modules/graph/graph.model';

@Component({
  selector: 'app-graph-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.sass']
})
export class OptionsComponent{

  NodeColorScheme = NodeColorScheme
  LinkColorScheme = LinkColorScheme
  Visibility = Visibility

  @Input() config$: BehaviorSubject<GraphConfig>;
  @Input() config: GraphConfig;

  selectedTab = 0;

  constructor() {
  }

  keys(object){
    return Object.keys(object);
  }

}
