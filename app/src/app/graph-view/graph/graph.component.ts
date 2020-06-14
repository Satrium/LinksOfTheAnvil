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

  linksHighlighted = false;

  @ViewChild("graph") graphElement:ElementRef;

  private Graph;
  constructor() { }

  ngOnInit(): void {
    
  }

  getLinkWidth(link){
    var width = 2;
    if(this.linksHighlighted){
      if(this.linkTypes[link.group] == 3){
        width = 4;
      }else{
        width = 1;
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
      .linkDirectionalArrowLength(link => link["bidirectional"]?0:3.5)
      .linkCurvature(link => link["bidirectional"]?0:0.1)
      .linkWidth((link:any) => this.getLinkWidth(link))
      .linkLabel((link:any) => link.bidirectional?Array.from(link.label).join("/"):link.group)
      .linkDirectionalArrowRelPos(1)
      .linkVisibility((x:any)=> this.linkTypes[x.group] >= 2)
      .nodeVisibility((x:any)=> this.articleTypes[x.group] >= 2)
      .linkDirectionalParticles((link:any) => this.linkTypes[link.group] == 3 ? 4 : 0)
      .linkDirectionalParticleWidth(2)
      .nodeThreeObject((node:any) => {
        // use a sphere as a drag handle
        const obj = new THREE.Mesh(
          new THREE.SphereGeometry(15),
          new THREE.MeshBasicMaterial({ depthWrite: false, transparent: true, opacity: 0 })
        );
        // add text sprite as child
        const sprite = new SpriteText(node.name);
        sprite.color = node.color;
        if(node.group === "tag"){
          sprite.textHeight = 5;
        }else{
          sprite.textHeight = Math.max(2, 10 * (Math.min(node.wordcount, 1000) / 1000));
        }
        
        obj.add(sprite);
            

        return obj;
      })
      .onNodeClick((node:any) => {
        this.focusNode(node);
      });
      this.Graph.d3Force('link').distance(link => link.group === "mention" ? this.mentionDistance: this.distance).d3Force('charge').strength(this.chargeStrength);
  }

  focusNode(node){
    // Aim at node from outside it
    const distance = 300;
    const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z);

    this.Graph.cameraPosition(
      { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, // new position
      node, // lookAt ({ x, y, z })
      3000  // ms transition duration
    );
  }

  ngOnChanges(changes:SimpleChanges){    
    console.log(changes);
    this.linksHighlighted = Object.values(this.linkTypes).includes("3");
    console.log(this.linksHighlighted);
    if(this.Graph){
      if(changes.nodes || changes.links)this.Graph.graphData({nodes:this.nodes, links:this.links});      
      this.Graph.dagMode(this.dagMode);
      //this.Graph.d3Force('link').distance(link => link.group === "mention" ? this.mentionDistance: this.distance).d3Force('charge').strength(this.chargeStrength);
      
    }
  }

}
