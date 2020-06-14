import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { ActivatedRoute } from '@angular/router';
import {switchMap, map, flatMap, tap, startWith} from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

const DagModes = {
  "None": null,
  "Top-Down": "td",
  "Bottom-Up": "bu",
  "Left-Right": "lr",
  "Right-Left": "rl",
  "Near-to-Far": "zour",
  "Far-to-Near":"zin",
  "Radially outwards":"radialout",
  "Radially inwards":"radialin"
};

@Component({
  selector: 'app-graph-view',
  templateUrl: './graph-view.component.html',
  styleUrls: ['./graph-view.component.sass']
})
export class GraphViewComponent implements OnInit {
  DagModes = DagModes

  presets$: Observable<any>;
  selectedPreset = null;

  searchField = new FormControl();
  nodes: any = [];
  searchFilteredNodes: Observable<any[]>;
  graphFocus =  new Subject<string>();
  
  dagMode = null;

  // Adds a root for all tags
  addRootTag = false;

  displayArticlesWithoutLinks = true;

  links:any = [];

  allNodes: any[] = [];
  allLinks: any[] = [];

  articleTypes = {};
  linkTypes = {};

  linksCollapsed = true;

  showOptions = false;

  constructor(private data:DataService, private route: ActivatedRoute, private _snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.presets$ = this.data.getPresets();
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
    console.log(this.articleTypes);
    var nodesWithLinks = new Set();    
    this.links = this.collapseLinks(this.allLinks.filter(x => this.linkTypes[x.group] > 0 && !(this.articleTypes[x.source.group] == 0 || this.articleTypes[x.target.group] == 0)));
    this.links.forEach(x => {
      nodesWithLinks.add(x.source.id);
      nodesWithLinks.add(x.target.id);
    });
    this.nodes = this.allNodes.filter(x => this.articleTypes[x.group] > 0 && (this.displayArticlesWithoutLinks || nodesWithLinks.has(x.id)));    
    if(this.addRootTag){      
      this.nodes.filter(x => x.group === "tag").forEach(x => {
        this.links.push({"source":"Tagged", "target":x.id, "group":"tagged"});
      });
      this.nodes.push({"id":"Tagged"})
    }
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

  applyPreset(){
    if(this.selectedPreset){
      console.log("Applying preset", this.selectedPreset)
      this.addRootTag = this.selectedPreset.addRootTag != null?this.selectedPreset.addRootTag:false;
      this.dagMode = this.selectedPreset.dagMode || null;
      this.displayArticlesWithoutLinks = this.selectedPreset.displayArticlesWithoutLinks != null?this.selectedPreset.displayArticlesWithoutLinks:true;

      if(this.selectedPreset.articleTypes){
        for(let type of Object.keys(this.articleTypes)){
          if(this.selectedPreset.articleTypes[type]){
            this.articleTypes[type] = this.selectedPreset.articleTypes[type];
          }else if(this.selectedPreset.articleTypes["_default"]){
            this.articleTypes[type] = this.selectedPreset.articleTypes["_default"];
          }else{
            this.articleTypes[type] = true;
          }
        }
      }
      if(this.selectedPreset.linkTypes){
        for(let type of Object.keys(this.linkTypes)){
          if(this.selectedPreset.linkTypes[type]){
            this.linkTypes[type] = this.selectedPreset.linkTypes[type];
          }else if(this.selectedPreset.linkTypes["_default"]){
            this.linkTypes[type] = this.selectedPreset.linkTypes["_default"];
          }else{
            this.linkTypes[type] = true;
          }
        }
      }
      this.update();
    }
    
  }
}
