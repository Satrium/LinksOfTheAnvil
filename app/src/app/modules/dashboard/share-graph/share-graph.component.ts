import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { AuthService } from '@app/service/auth.service';
import { DataService } from '@data/service/data.service';
import { Preset } from '@global/graph.config';
import { SharedGraphInfo, SharedGraphInfoResponse } from '@global/share';
import { World } from '@global/worldanvil/world';
import { Observable } from 'rxjs/internal/Observable';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-share-graph',
  templateUrl: './share-graph.component.html',
  styleUrls: ['./share-graph.component.sass'],
  providers: [{
    provide: STEPPER_GLOBAL_OPTIONS, useValue: {showError: true}
  }]
})
export class ShareGraphComponent implements OnInit {

  @ViewChild('stepper') private stepper: MatStepper;
  worlds$:Observable<World[]>;
  world:World;
  
  presets$:Observable<Preset[]>;
  preset:Preset;

  autoUpdate: boolean = false;
  shared: SharedGraphInfoResponse;

  constructor(private data:DataService, public auth:AuthService) {}

  ngOnInit() {
    this.worlds$ = this.data.getWorlds().pipe(map(x => x.worlds));
    this.presets$ = this.data.getPresets();    
  }

  worldSelected(world:World){
    this.world = world;
    setTimeout(() => this.stepper.next(), 1);    
  }

  presetSelected(preset:Preset){
    this.preset = preset;
    setTimeout(() => this.stepper.next(), 1); 
  }

  shareGraph(){
    let shared:SharedGraphInfo = {world: this.world.id, preset: this.preset.id, creationDate: null, modificationDate: null}
    if(this.autoUpdate){
      shared.authToken = this.auth.authToken;
    }
    this.data.postSharedGraph(shared).subscribe((x:SharedGraphInfoResponse) => {
      this.shared = x;
      setTimeout(() => this.stepper.next(), 1); 
    }, console.error);
  }

}
