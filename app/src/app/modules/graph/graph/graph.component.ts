import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit, SimpleChanges } from '@angular/core';
import { GraphConfig } from '../graph.object';
import ForceGraph3D, { ForceGraph3DInstance } from '3d-force-graph';
import { Observable, Subscription } from 'rxjs';
import { GraphData, GraphNode, Visibility, LinkColorScheme, NodeColorScheme, GraphLink } from '../graph.model';
import distinctColors from 'distinct-colors';
import SpriteText from 'three-spritetext';
import { Sprite } from 'three';


@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.sass']
})
export class GraphComponent implements OnInit, AfterViewInit {

  @Input() config$: Observable<GraphConfig>;

  private nodeColors = {};
  private linkColors = {};

  private config: GraphConfig;
  private Graph: ForceGraph3DInstance;

  private configSubscription:Subscription;

  @ViewChild("graph") graphContainer:ElementRef;

  constructor() { }

  ngOnInit(): void{

  }

  ngAfterViewInit(): void {
    this.Graph = ForceGraph3D({controlType: "orbit"})(this.graphContainer.nativeElement)
      .graphData({nodes:[], links:[]})
      .nodeVisibility(node => (<GraphNode>node).visibility != Visibility.HIDDEN)
      .linkVisibility(link => (<GraphLink>link).visibility != Visibility.HIDDEN)
      .enableNodeDrag(false)
      .nodeThreeObjectExtend(true)
      .nodeVal(node => node["wordcount"] || 100)
      .nodeRelSize(0.75)
      .nodeThreeObject((node:any)=>{
        const obj = new SpriteText(node.name);
        obj.textHeight = 3;
        return obj;
      }).onNodeClick((node:any) => {
        this.focusNode(node);
      });
  }

  @Input()
  public set graphData(graphData:GraphData){
    console.log(graphData);
    if(this.configSubscription)this.configSubscription.unsubscribe();
    this.configSubscription = this.config$.subscribe(x =>{
      let data = x.apply(graphData)
      console.log(x, graphData);
       // Get distinct groups for coloring
      this.generateColors(data.nodes, data.links, x.nodes.colorScheme, x.links.colorScheme);
      data.nodes.forEach(node => node["color"] = this.nodeColors[x.nodes.colorScheme === NodeColorScheme.CLUSTER?node["cluster"]:node["group"]]?.hex())
      this.config = x;
      this.Graph.graphData({nodes: data.nodes.filter(x => x.visibility != Visibility.OFF), links: data.links.filter(x => x.visibility != Visibility.OFF)});
      this.Graph
        .dagMode(<any>x.dagMode?.toString() || null)
        .linkColor(link => x.links.colorScheme === LinkColorScheme.GROUP?this.linkColors[link["group"]]:
          (x.links.colorScheme === LinkColorScheme.SOURCE?link.source["color"]:link.target["color"])
        );
    });
  }
  private focusNode(node){
    console.log(node);
    // Aim at node from outside it
    const distance = 500;
    const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z);

    this.Graph.cameraPosition(
      { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, // new position
      node, // lookAt ({ x, y, z })
      3000  // ms transition duration
    );
  }

  private generateColors(nodes, links, nodeScheme:NodeColorScheme, linkScheme:LinkColorScheme){
    // Nodes
    let nodeGroups = new Set();
    nodes.forEach(node => nodeGroups.add(nodeScheme === NodeColorScheme.GROUP?node["group"]:node["cluster"]));
    nodeGroups.delete(undefined);
    if(nodeGroups.size > Object.keys(this.nodeColors).length){
      let colors = distinctColors({count: nodeGroups.size, chromaMin: 20, lightMin: 20});
      nodeGroups.forEach((x:any, i:number) => {
        this.nodeColors[x] = colors[i];
      })
    }

    //Links
    let linkGroups = new Set();
    links.forEach(link => linkGroups.add(link["group"]));
    linkGroups.delete(undefined);
    if(linkGroups.size > Object.keys(this.linkColors).length){
      let colors = distinctColors({count: linkGroups.size, chromaMin: 20, lightMin: 20});
      let counter = 0;
      linkGroups.forEach((x:any) => {
        this.linkColors[x] = colors[counter++];
      });
    }
    console.log(nodeGroups, this.nodeColors, linkGroups, this.linkColors);
  }
}
