import { Component, OnInit, ViewChild } from '@angular/core';
import { GraphConfig } from '@modules/graph/graph.object';
import { Observable, from, BehaviorSubject } from 'rxjs';
import { environment } from '@env';
import { DataService } from '@data/service/data.service';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { tap, switchMap } from 'rxjs/operators';
import { GraphData } from '@modules/graph/graph.model';
import { MatDialog } from '@angular/material/dialog';
import { OptionsComponent } from './options/options.component';

@Component({
  selector: 'app-explore',
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.sass']
})
export class ExploreComponent implements OnInit {

  isConfigOpen = false;

  config: GraphConfig;
  config$: BehaviorSubject<GraphConfig>;

  @ViewChild('graph') graph;
  @ViewChild('options') options:OptionsComponent;

  loading = false;

  graphData:GraphData;

  constructor(private data:DataService, private route: ActivatedRoute,
    private _snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.config = new GraphConfig(<any> environment.defaultConfig);
    this.config$ = new BehaviorSubject(this.config);    
    this.route.params.pipe(
      tap(x => this.loading = true),
      switchMap(x => this.data.getGraph(x?.world).pipe(tap(x => console.log(x)))),
    ).subscribe(graph => {
      this.loading = false;
      if(!this.config.nodes.typeVisibility)this.config.nodes.typeVisibility = {};
      graph['nodes'].forEach(node => {
        if(node.group != "tag" && !(node.group in this.config.nodes.typeVisibility)){
          this.config.nodes.typeVisibility[node.group] = this.config.nodes.defaultVisibility;
        }
      });
      if(!this.config.links.typeVisibility)this.config.links.typeVisibility = {};
      graph['links'].forEach(link => {
        if(link.group != "tagged" && !(link.group in this.config.links.typeVisibility)){
          this.config.links.typeVisibility[link.group] = this.config.links.defaultVisibility;
        }
      });
      this.graphData = {nodes: graph['nodes'], links:graph['links']}
    });
  }

  test(){
    this.config$.next(this.config);
  }

  private openSnackBar(message: string, action: string=null, duration:number = 2000) {
    this._snackBar.open(message, action, {
      duration: duration,
    });
  }
}
