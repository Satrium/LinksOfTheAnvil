import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { ActivatedRoute } from '@angular/router';
import {switchMap, map, flatMap, tap} from 'rxjs/operators';

@Component({
  selector: 'app-graph-view',
  templateUrl: './graph-view.component.html',
  styleUrls: ['./graph-view.component.sass']
})
export class GraphViewComponent implements OnInit {

  nodes: any = [];
  links:any = [];

  allNodes: any[] = [];
  allLinks: any[] = [];

  articleTypes = {};
  linkTypes = {};

  showOptions = false;

  constructor(private data:DataService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.params.pipe(
      tap(console.log),
      switchMap(x => this.data.getGraph(x?.world).pipe(tap(x => console.log(x)))),
    ).subscribe((x:any) => {
      console.log("Loaded", x);
      this.allNodes = x["nodes"]; 
      this.allLinks = x["links"];
      for(var node of this.allNodes){        
        if(!(node.group in this.articleTypes)){
          this.articleTypes[node.group] = "2";
        }
      }
      for(var link of this.allLinks){        
        if(!(link.group in this.linkTypes)){
          this.linkTypes[link.group] = "2";
        }
      }
      this.update();
    });
  }

  update(){
    console.log(this.articleTypes, this.linkTypes);
    this.nodes = this.allNodes.filter(x => this.articleTypes[x.group] > 0);
    this.links = this.allLinks.filter(x => this.linkTypes[x.group] > 0 && !(this.articleTypes[x.source.group] == 0 || this.articleTypes[x.target.group] == 0));
  }

  keys(obj){
    return Object.keys(obj);
  }

  log(event){
    console.log(event);
  }
}
