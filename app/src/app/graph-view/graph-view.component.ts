import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { ActivatedRoute } from '@angular/router';
import {switchMap, map, flatMap, tap, startWith} from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-graph-view',
  templateUrl: './graph-view.component.html',
  styleUrls: ['./graph-view.component.sass']
})
export class GraphViewComponent implements OnInit {

  searchField = new FormControl();
  nodes: any = [];
  searchFilteredNodes: Observable<any[]>;
  graphFocus =  new Subject<string>();

  links:any = [];

  allNodes: any[] = [];
  allLinks: any[] = [];

  articleTypes = {};
  linkTypes = {};

  linksCollapsed = true;

  showOptions = false;

  constructor(private data:DataService, private route: ActivatedRoute, private _snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.searchFilteredNodes = this.searchField.valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.label),
        map(name => name ? this.nodes.filter(option => option.name.toLowerCase().includes(name.toLowerCase())).slice(0,20) : this.nodes.slice(0, 20))
      )
    this.route.params.pipe(
      tap(console.log),
      tap(x => this.openSnackBar("We are loading your world. This might take up to a few minutes for large worlds", null, 0)),
      switchMap(x => this.data.getGraph(x?.world).pipe(tap(x => console.log(x)))),
    ).subscribe((x:any) => {
      this._snackBar.dismiss();
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
    }, error => {
      this.openSnackBar("An error occured");
      this._snackBar.dismiss();
    });
  }

  
  searchBarDisplay(node): string {
    return node && node.label ? node.label : '';
  }

  update(){
    this.nodes = this.allNodes.filter(x => this.articleTypes[x.group] > 0);
    this.links = this.collapseLinks(this.allLinks.filter(x => this.linkTypes[x.group] > 0 && !(this.articleTypes[x.source.group] == 0 || this.articleTypes[x.target.group] == 0)));
  }

  collapseLinks(linkList){
    if(!this.linksCollapsed)return linkList;
    var newLinks = {};
    for(let link of linkList){
      let id = [typeof(link.source) === "string"?link.source:link.source.id, typeof(link.target) === "string"?link.target:link.target.id].sort().join("-");
      if(newLinks[id]){
        newLinks[id].group = [newLinks[id].group, link.group].sort()[0];
        newLinks[id].label.add(link.label);
        newLinks[id].bidirectional = true;
      }else{
        newLinks[id] = link;
        newLinks[id].label = new Set([link.group]);
      }      
    }
    return Object.values(newLinks);
  }

  keys(obj){
    return Object.keys(obj);
  }

  log(event){
    console.log(event);
  }

  openSnackBar(message: string, action: string=null, duration:number = 2000) {
    this._snackBar.open(message, action, {
      duration: duration,
    });
  }
}
