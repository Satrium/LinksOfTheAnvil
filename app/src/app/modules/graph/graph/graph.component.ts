import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit, HostListener, ContentChild, TemplateRef } from '@angular/core';
import { GraphConfig } from '@global/graph.object';
import ForceGraph3D, { ForceGraph3DInstance } from '3d-force-graph';
import { Observable, Subscription } from 'rxjs';
import { Graph, GraphNode, GraphLink } from '@global/graph';
import { DisplayMode, ElementVisibility, LinkColorScheme, NodeColorScheme } from '@global/graph.enum';
import distinctColors from 'distinct-colors';
import SpriteText from 'three-spritetext';
import { Sprite, Vector3 } from 'three';
import { GraphSidebarDirective } from './sidebar.directive';
import { FormControl } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';


@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.sass']
})
export class GraphComponent implements OnInit, AfterViewInit {

  @ContentChild(GraphSidebarDirective) sidebarTemplate;
  @Input() config$: Observable<GraphConfig>;

  nodeColors = {};
  linkColors = {};

  displayNodeLegend = false;
  displayLinkLegend = false;

  private config: GraphConfig;
  private Graph: ForceGraph3DInstance;

  private data: Graph;

  private configSubscription:Subscription;

  private textHeight:number = null;

  // highlights
  linksHighlighted = false;
  nodesHiglighted = false;
  nodeSelected = false;
  highlightLinks = new Set();
  highlightNodes = new Set();
  hoverNode = null;

  // search
  searchField = new FormControl();
  searchFilteredNodes: Observable<any[]>;
  

  @ViewChild("graph") graphContainer:ElementRef;

  constructor() { }

  ngOnInit(): void{
    this.textHeight = this.config?.visuals?.textHeight || 4;
  }

  ngAfterViewInit(): void {
    this.Graph = ForceGraph3D({controlType: "orbit"})(this.graphContainer.nativeElement)
      .graphData({nodes:[], links:[]})
      .nodeVisibility((node:GraphNode) => node.visibility != ElementVisibility.HIDDEN)
      .linkVisibility((link:GraphLink) => (<GraphLink>link).visibility != ElementVisibility.HIDDEN)
      .nodeColor((node:GraphNode) => this.nodesHiglighted && !this.highlightNodes.has(node)?"#242424":node.color)
      .linkWidth((link:GraphLink) => this.getLinkWidth(link))
      .enableNodeDrag(false)
      .nodeThreeObjectExtend(true)
      .nodeVal((node:GraphNode) => (this.nodesHiglighted && !this.highlightNodes.has(node)?node.wordcount/4:node.wordcount) || 50)
      .linkDirectionalArrowLength((link:GraphLink) => link["bidirectional"]?0:3.5)
      .linkDirectionalArrowRelPos(1)     
      .onNodeRightClick((node:GraphNode) => {if(node.url)window.open(node.url, "_blank");}) 
      .nodeThreeObject((node:GraphNode)=>{
        const obj = new SpriteText(node.name);
        obj.position.add(new Vector3(0, 8, 0));
        obj.textHeight = this.config?.visuals?.textHeight || 4;        
        if(this.highlightNodes.has(node)){
          obj.textHeight *= 2;
          obj.backgroundColor = "#808080";
          obj.borderColor = "#808080"
          obj.color = "#ffffff"
        }else if(this.nodesHiglighted){
          obj.textHeight /= 2;
          obj.color = "#808080"
        }
        return obj;
      }).onNodeClick((node:GraphNode) => {
        this.focusNode(node);
      });
      (this.Graph.d3Force('link') as any).distance((link:GraphLink) => link.type === "mention" ? 150: 40).d3Force('charge').strength(-120);
      
      
  }

  @Input()
  public set graphData(graphData:Graph){
    //this.Graph.controls()["enableRotate"] = false;
    if(this.configSubscription)this.configSubscription.unsubscribe();
    this.configSubscription = this.config$.subscribe(x =>{
      switch(x.visuals?.displayMode){
        case DisplayMode.TWO_DIMENSIONS:
          this.Graph.controls()["enableRotate"] = false;
          this.Graph.numDimensions(2);
          
          break;        
        case DisplayMode.NORMAL:
        default:
          this.Graph.controls()["enableRotate"] = true;
          this.Graph.numDimensions(3);
          break;
      }
      this.config = x;
      this.data = x.apply(graphData)
      console.log("Graph Update", x, graphData);
       // Get distinct groups for coloring
      this.generateColors(this.data.nodes, this.data.links, x.nodes.colorScheme, x.links.colorScheme);
      this.data.nodes.forEach((node:GraphNode) => node.color = this.nodeColors[x.nodes.colorScheme === NodeColorScheme.CLUSTER?node.cluster:node.type]?.hex())
      
      this.Graph.graphData({nodes: this.data.nodes.filter(x => x.visibility != ElementVisibility.OFF), links: this.data.links.filter(x => x.visibility != ElementVisibility.OFF)});
      this.Graph
        .dagMode(<any>x.dagMode?.toString() || null)
        .linkColor((link:GraphLink) => { return x.links.colorScheme === LinkColorScheme.GROUP?this.linkColors[link.type].hex():
          // TODO: Please optimize this!
          (x.links.colorScheme === LinkColorScheme.SOURCE?(link.source as GraphNode)?.color || (this.data.nodes.find(x => x.id == link.source) as GraphNode)?.color:(link.target as GraphNode)?.color || (this.data.nodes.find(x => x.id == link.target) as GraphNode)?.color)}
        );
      this.searchFilteredNodes = this.searchField.valueChanges
        .pipe(
          startWith(''),
          map(value => typeof value === 'string' ? value : value.label),
          map(name => name ? this.data.nodes.filter(option => option.visibility === ElementVisibility.ON && option.name.toLowerCase().includes(name.toLowerCase())).slice(0,20) : this.data.nodes.slice(0, 20))
        );
      // apply visual settings
      if(this.Graph.linkOpacity() != x.visuals?.linkOpacity)this.Graph.linkOpacity(x.visuals?.linkOpacity);
      if(this.Graph.nodeOpacity() != x.visuals?.nodeOpacity)this.Graph.nodeOpacity(x.visuals?.nodeOpacity);
      if(this.Graph.nodeRelSize() != x.visuals?.nodeRelSize)this.Graph.nodeRelSize(x.visuals?.nodeRelSize);
      this.Graph.refresh();
    });
  }
  
  focusNode(node : GraphNode){
    const minDistance = 200;
    const maxDistance = 600;

    // Aim at node from outside it  
    let camPos = this.Graph.cameraPosition();
    let camPosVector = new Vector3(camPos.x, camPos.y, camPos.z);
    let nodePosVector = new Vector3(node.x, node.y, node.z);
    console.log(camPosVector.distanceTo(nodePosVector));
    if(camPosVector.distanceTo(nodePosVector) > maxDistance){
      camPosVector.normalize();
      camPosVector.multiplyScalar(maxDistance);
    }else if (camPosVector.distanceTo(nodePosVector) < minDistance){
      camPosVector.normalize();
      camPosVector.multiplyScalar(minDistance);
    }

    this.Graph.cameraPosition(
      camPosVector, // new position
      node as any, // lookAt ({ x, y, z })
      2000  // ms transition duration
    );

    this.highlightLinks.clear();
    this.highlightNodes.clear();
    this.linksHighlighted = true;
    this.nodesHiglighted = true;
    this.nodeSelected = true;
    this.highlightNodes.add(node);
    node.neighbors?.forEach(link => this.highlightNodes.add(link));
    node.links?.forEach(link => this.highlightLinks.add(link));
    this.Graph.refresh();

    
  }

  focusNodeType(type:string){
    this.highlightLinks.clear();
    this.highlightNodes.clear();
    this.linksHighlighted = true;
    this.nodesHiglighted = true;
    this.nodeSelected = true;
    if(this.config.nodes.colorScheme === NodeColorScheme.CLUSTER){
      this.data.nodes.filter(x => x.cluster === type).forEach(node =>  this.highlightNodes.add(node));
      this.data.links.filter(x => this.highlightNodes.has(x.source)).forEach(link => this.highlightLinks.add(link));
    }else{
      this.data.nodes.filter(x => x.type === type).forEach(node =>  this.highlightNodes.add(node));
    }
    this.Graph.refresh();
  }

  focusLinkType(type:string){
    this.highlightLinks.clear();
    this.highlightNodes.clear();
    this.linksHighlighted = true;
    this.nodesHiglighted = true;
    this.nodeSelected = true;
    this.data.links.filter(x => x.type === type).forEach(link => {
      this.highlightNodes.add(link.source);
      this.highlightNodes.add(link.target);
      this.highlightLinks.add(link);
    })
    this.Graph.refresh();
  }

  highlightStubs(){
    this.highlightLinks.clear();
    this.highlightNodes.clear();
    this.linksHighlighted = true;
    this.nodesHiglighted = true;
    this.data.nodes.filter(node => node.wordcount <= 50).forEach(link => {
      this.highlightNodes.add(link);
    });
    this.Graph.refresh();
  }
  


  @HostListener('window:keydown', ['$event'])
  doSomething($event) {
    console.log("Key press", $event)
    if($event.keyCode === 27){
      this.clearFocus();
    }
  }

  private clearFocus(){
    console.log("Clearing Focus", this.nodeSelected);
    if(this.nodeSelected || this.linksHighlighted || this.nodesHiglighted){
      this.highlightLinks.clear();
      this.highlightNodes.clear();
      this.nodeSelected = false;
      this.linksHighlighted = false;
      this.nodesHiglighted = false;
      this.Graph.refresh();          
    }
  }

  private generateColors(nodes:GraphNode[], links:GraphLink[], nodeScheme:NodeColorScheme, linkScheme:LinkColorScheme){
    // Nodes
    let nodeGroups = new Set();    
    this.nodeColors = {}
    nodes.forEach(node => nodeGroups.add(nodeScheme === NodeColorScheme.GROUP?node.type:node.cluster));
    nodeGroups.delete(undefined);
    let colors = distinctColors({count: nodeGroups.size, chromaMin: 20, lightMin: 20});
    let counter = 0;
    nodeGroups.forEach((group:any) => {
      this.nodeColors[group] = colors[counter];
      counter++;
    });

    //Links
    let linkGroups = new Set();
    this.linkColors = {}
    links.forEach(link => linkGroups.add(link.type));
    linkGroups.delete(undefined);
    colors = distinctColors({count: linkGroups.size, chromaMin: 20, lightMin: 20});
    counter = 0;
    linkGroups.forEach((x:any) => {
      this.linkColors[x] = colors[counter];
      counter++;
    });
    
    console.log(nodeGroups, this.nodeColors, linkGroups, this.linkColors);
  }

  private getLinkWidth(link:GraphLink){
    var width = 1;
    if(this.linksHighlighted){
      if(this.highlightLinks.has(link)){
        width = 2;
      }else{
        width = 0.1;
      }
    }
    return width / (link.type === "mention"?2:1);
  }

  searchBarDisplay(node:GraphNode): string {
    return node && node.visibility === ElementVisibility.ON && node.label ? node.label : '';
  }
}
