import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import ForceGraph3D from '3d-force-graph';
import * as THREE from 'three';
import SpriteText from 'three-spritetext';

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
  @ViewChild("graph") graphElement:ElementRef;

  private Graph;
  constructor() { }

  ngOnInit(): void {
    
  }

  ngAfterViewInit(){
    this.Graph = ForceGraph3D()(this.graphElement.nativeElement)
      .graphData({nodes:this.nodes, links:this.links})
      .nodeAutoColorBy('group')
      .linkAutoColorBy('group')
      .linkDirectionalArrowLength(3.5)
      .linkCurvature(0.1)
      .linkWidth((link:any) => link.group === "mention"?0:0.5)
      .linkDirectionalArrowRelPos(1)
      .nodeThreeObject((node:any) => {
        console.log(node)
        // use a sphere as a drag handle
        const obj = new THREE.Mesh(
          new THREE.SphereGeometry(15),
          new THREE.MeshBasicMaterial({ depthWrite: false, transparent: true, opacity: 0 })
        );

        // add text sprite as child
        const sprite = new SpriteText(node.name);
        sprite.color = node.color;
        sprite.textHeight = Math.max(2, 10 * (Math.min(node.wordcount, 1000) / 1000));
        obj.add(sprite);

        return obj;
      })
      .onNodeClick((node:any) => {
        // Aim at node from outside it
        const distance = 200;
        const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z);

        this.Graph.cameraPosition(
          { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, // new position
          node, // lookAt ({ x, y, z })
          3000  // ms transition duration
        );
      });
      this.Graph.d3Force('link').distance(link => link.group === "mention" ? this.mentionDistance: this.distance).d3Force('charge').strength(this.chargeStrength);
  }

  ngOnChanges(){
    if(this.Graph){
      this.Graph.graphData({nodes:this.nodes, links:this.links});
      this.Graph.d3Force('link').distance(link => link.group === "mention" ? this.mentionDistance: this.distance).d3Force('charge').strength(this.chargeStrength);
    }
  }

}
