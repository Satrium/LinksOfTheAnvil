import { Component, OnInit, Input, ElementRef, ViewChild, SimpleChange, SimpleChanges } from '@angular/core';
import ForceGraph3D from '3d-force-graph';
import * as THREE from 'three';
import SpriteText from 'three-spritetext';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.sass']
})
export class GraphComponent implements OnInit {

  @Input() nodes:any = [];
  @Input() links:any = [];
  @Input() chargeStrength:number = -120;
  @Input() distance = 40;
  @Input() mentionDistance = 150;
  @Input() articleTypes = {};
  @Input() linkTypes = {};
  @Input() dagMode = null;
  @Input() numDimensions:string = "3";
  @Input() highlightSelectedNodes = true;


  // highlights
  linksHighlighted = false;
  nodesHiglighted = false;
  nodeSelected = false;
  highlightLinks = new Set();
  highlightNodes = new Set();
  hoverNode = null;

  @ViewChild("graph") graphElement:ElementRef;

  private Graph;
  constructor() { }

  ngOnInit(): void {
    
  }

  getLinkWidth(link){
    var width = 2;
    if(this.linksHighlighted){
      if(this.linkTypes[link.group] == 3 || this.highlightLinks.has(link)){
        width = 4;
      }else{
        width = 0.5;
      }
    }
    return width / (link.group === "mention"?2:1);
  }

  ngAfterViewInit(){
    this.Graph = ForceGraph3D()(this.graphElement.nativeElement)
      .graphData({nodes:this.nodes, links:this.links})      
      .dagMode(this.dagMode)
      .nodeAutoColorBy('group')
      .linkAutoColorBy('group')
      .numDimensions(<any>this.numDimensions)
      .linkDirectionalArrowLength(link => link["bidirectional"]?0:3.5)
      .linkCurvature(link => link["bidirectional"]?0:0.1)
      .linkWidth((link:any) => this.getLinkWidth(link))
      .linkLabel((link:any) => link.bidirectional?Array.from(link.label).join("/"):link.group)
      .linkDirectionalArrowRelPos(1)
      .linkVisibility((x:any)=> this.linkTypes[x.group] >= 2)
      .nodeVisibility((x:any)=> this.articleTypes[x.group] >= 2)
      .linkDirectionalParticles((link:any) => (this.linkTypes[link.group] == 3 || this.highlightLinks.has(link)) ? 4 : 0)
      .linkDirectionalParticleWidth(2)
      .nodeThreeObject((node:any) => {
        // use a sphere as a drag handle
        const obj = new THREE.Mesh(
          new THREE.SphereGeometry(15),
          new THREE.MeshBasicMaterial({ depthWrite: false, transparent: true, opacity: 0 })
        );
        // add text sprite as child
        const sprite = new SpriteText(node.name);
        sprite.color = node.color + "bb";      
        if(node.group === "tag"){
          sprite.textHeight = 4;
        }else{
          sprite.textHeight = Math.max(2, 5 * (Math.min(node.wordcount, 1000) / 1000));
        }
        if(this.highlightNodes.has(node)){
          sprite.textHeight *= 2;
          sprite.backgroundColor = "#ffffff44";
          sprite.borderColor = "#ffffff66"
        }else if(this.nodesHiglighted){
          sprite.textHeight /= 2;
        }
        obj.add(sprite);
        return obj;
      })
      .onNodeClick((node:any) => {
        this.focusNode(node);
      }).onBackgroundClick(() => {
        this.nodeSelected = false;
      }).onNodeHover((node:any) => {
        // no state change
        if (node && this.hoverNode === node || this.nodeSelected) return;

        this.highlightLinks.clear();
        this.highlightNodes.clear();
        if (node) {
          node.links?.forEach(link => this.highlightLinks.add(link));
          this.linksHighlighted = true;
          this.nodesHiglighted = true;
        }else{
          this.linksHighlighted = false;
          this.nodesHiglighted = false;
        }

        this.hoverNode = node || null;
        this.Graph
          .nodeColor(this.Graph.nodeColor())
          .linkWidth(this.Graph.linkWidth())
          .linkDirectionalParticles(this.Graph.linkDirectionalParticles());
      }).enableNodeDrag(false);
      window["test"] = this.Graph;
      this.Graph.d3Force('link').distance(link => link.group === "mention" ? this.mentionDistance: this.distance).d3Force('charge').strength(this.chargeStrength);
  }

  focusNode(node){
    console.log(node);
    // Aim at node from outside it
    const distance = 500;
    const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z);

    this.highlightLinks.clear();
    this.linksHighlighted = true;
    this.nodesHiglighted = true;
    this.nodeSelected = true;
    this.highlightNodes.add(node);
    node.neighbors?.forEach(link => this.highlightNodes.add(link));
    node.links?.forEach(link => this.highlightLinks.add(link));
    this.Graph.refresh();
    this.Graph.cameraPosition(
      { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, // new position
      node, // lookAt ({ x, y, z })
      3000  // ms transition duration
    );
          
  }

  ngOnChanges(changes:SimpleChanges){    
    this.linksHighlighted = Object.values(this.linkTypes).includes("3");
    if(this.Graph){
      if(changes.nodes || changes.links){
        this.Graph.graphData({nodes:this.nodes, links:this.links});
        var gData = this.Graph.graphData();
        let nodeDict = {};
        gData.nodes.forEach(x => nodeDict[x.id] = x);
        gData.links.forEach(link => {
          const a = nodeDict[link.source];
          const b = nodeDict[link.target];
          if(!a || !b)return;
          !a.neighbors && (a.neighbors = []);
          !b.neighbors && (b.neighbors = []);
          a.neighbors.push(b);
          b.neighbors.push(a);
    
          !a.links && (a.links = []);
          !b.links && (b.links = []);
          a.links.push(link);
          b.links.push(link);
        });
      }      
      console.log(gData);
      this.Graph.dagMode(this.dagMode).numDimensions(<any>this.numDimensions);
      //this.Graph.d3Force('link').distance(link => link.group === "mention" ? this.mentionDistance: this.distance).d3Force('charge').strength(this.chargeStrength);
      
    }
  }

}
