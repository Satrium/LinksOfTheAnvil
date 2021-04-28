import { Component, OnInit, ViewChild } from '@angular/core';
import { GraphConfig } from '@global/graph.object';
import { Observable, from, BehaviorSubject, of, combineLatest, ReplaySubject } from 'rxjs';
import { environment } from '@env';
import { DataService } from '@data/service/data.service';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { tap, switchMap, startWith, map, catchError } from 'rxjs/operators';
import { Graph } from '@global/graph';
import { MatDialog } from '@angular/material/dialog';
import { OptionsComponent } from './options/options.component';
import { Preset } from '@global/graph.config';

@Component({
  selector: 'app-explore',
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.sass']
})
export class ExploreComponent implements OnInit {

  isConfigOpen = false;

  preset: Preset;
  config$: ReplaySubject<GraphConfig>;

  @ViewChild('graph') graph;
  @ViewChild('options') options:OptionsComponent;

  loading = false;

  graphData:Graph;

  constructor(private data:DataService, private route: ActivatedRoute,
    private _snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.config$ = new ReplaySubject(1);   
    
    combineLatest([this.route.params, this.route.queryParams]).pipe(
      map(x => ({"params":x[0], "query":x[1]})),
      tap(x => this.loading = true),
      switchMap(query => combineLatest(
        [
          this.data.getGraph(query.params?.world).pipe(tap(x => console.log("Graph", x))), 
          query.query?.preset?
            this.data.getPreset(query.query?.preset).pipe(tap(console.log, console.error),catchError(x => of(null))):
            of(null)
        ]))
    ).subscribe(data => { 
      let graph = data[0]; let preset = data[1] as Preset;      
      if(preset){
        this.preset = preset;
        this.preset.config = new GraphConfig(<any> preset.config);
      }else{
        this.preset = {
          name: "default",
          id: "default",
          config: new GraphConfig(<any> environment.defaultConfig)
        }
      }
      this.config$.next(this.preset.config as GraphConfig); 
      this.graphData = graph;  
      this.loading = false;  
    });
  }
}
