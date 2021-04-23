import { Component, OnInit, ViewChild } from '@angular/core';
import { GraphConfig } from '@modules/graph/graph.object';
import { Observable, from, BehaviorSubject, of, combineLatest } from 'rxjs';
import { environment } from '@env';
import { DataService } from '@data/service/data.service';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { tap, switchMap, startWith, map, catchError } from 'rxjs/operators';
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
    
    combineLatest([this.route.params, this.route.queryParams]).pipe(
      map(x => ({"params":x[0], "query":x[1]})),
      tap(x => console.log("Query params", x)),
      switchMap(query => combineLatest(
        [
          this.data.getGraph(query.params?.world).pipe(tap(x => console.log("Graph", x))), 
          query.query?.preset?
            this.data.getPreset(query.query?.preset).pipe(tap(console.log, console.error),catchError(x => of(this.config))):
            of(this.config)
        ]))
    ).subscribe(data => {
      console.log("Test", data);
      let graph = data[0]; let config = data[1];      
      this.loading = false;     
      this.config$.next(new GraphConfig(<any> config)); 
      this.graphData = {nodes: graph['nodes'], links:graph['links']}      
    });
  }
}
