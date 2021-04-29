import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataService } from '@data/service/data.service';
import { environment } from '@env';
import { Graph } from '@global/graph';
import { GraphConfig } from '@global/graph.object';
import { SharedGraph } from '@global/share';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-share',
  templateUrl: './share.component.html',
  styleUrls: ['./share.component.sass']
})
export class ShareComponent implements OnInit {

  graphData: Graph;
  config$: BehaviorSubject<GraphConfig>;

  constructor(private data:DataService, private router: ActivatedRoute) {
    this.config$ = new BehaviorSubject(new GraphConfig(<any> environment.defaultConfig))
   }

  ngOnInit(): void {
    this.router.params.pipe(
      switchMap(x => this.data.getSharedGraph(x["id"]))
    ).subscribe((graph:SharedGraph) =>{      
      this.graphData = graph.graph;
      this.config$.next(new GraphConfig(graph.preset.config as GraphConfig));      
    });
  }

}
