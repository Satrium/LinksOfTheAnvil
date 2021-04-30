import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatStepper } from '@angular/material/stepper';
import { AuthService } from '@app/service/auth.service';
import { DataService } from '@data/service/data.service';
import { environment } from '@env';
import { Graph } from '@global/graph';
import { GraphConfigModel, Preset } from '@global/graph.config';
import { GraphConfig } from '@global/graph.object';
import { SharedGraphInfo, SharedGraphInfoResponse } from '@global/share';
import { World } from '@global/worldanvil/world';
import { ReplaySubject } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { map, take, tap } from 'rxjs/operators';

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
  graph$:Observable<Graph>;
  
  presets$:Observable<Preset[]>;
  preset:Preset;
  config$: ReplaySubject<GraphConfig> = new ReplaySubject(1);

  autoUpdate: boolean = false;
  shared: SharedGraphInfoResponse;

  constructor(private data:DataService, public auth:AuthService, private _snackBar: MatSnackBar) { }

  ngOnInit() {
    this.worlds$ = this.data.getWorlds().pipe(map(x => x.worlds));
    this.presets$ = this.data.getPresets();        
    this.config$.next(new GraphConfig(environment.defaultConfig as any));
  }

  worldSelected(world:World){
    this.world = world;
    this.graph$ = this.data.getGraph(world.id);
    setTimeout(() => this.stepper.next(), 1);    
  }

  presetSelected(preset:Preset){
    this.data.getPreset(preset.id)
      .pipe(take(1))
      .subscribe((p:Preset) => {        
        this.preset = p;
        this.preset.config = new GraphConfig(preset.config as GraphConfig)        
        this.config$.next(this.preset.config as GraphConfig);
      });
    
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
    }, () => {
      this._snackBar.open("Something went wrong while publishing the graph",null, {panelClass:'panel-error',duration:5000});
    });
  }

}
