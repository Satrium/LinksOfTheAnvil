import { Component, OnInit } from '@angular/core';
import { DataService } from '@data/service/data.service';
import { Router } from '@angular/router';
import { Observable, zip } from 'rxjs';
import { Preset } from '@global/graph.config';
import { map, share, skipWhile } from 'rxjs/operators';
import { World } from '@global/worldanvil/world';
import { normalizeArray } from '@global/utils'
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { SelectionComponent } from '@shared/components/selection/selection.component';
import { ShareGraphComponent } from '../share-graph/share-graph.component';
import { SharedGraph, SharedGraphInfo } from '@global/share';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.sass']
})
export class DashboardComponent implements OnInit {

  globalPresets = [];

  worlds$:Observable<World[]>

  presets$: Observable<Preset[]>;
  sharedGraphInfo$: Observable<SharedGraphInfo[]>;

  deletionPresetSelected: string;

  displayedColumns: string[] = ['owner', 'name', 'description', 'actions'];
  sharedGraphColumns: string[] = ['world','preset', 'modificationDate', 'actions'];
  constructor(private data:DataService, private router:Router, private _snackBar: MatSnackBar,public dialog: MatDialog) { }

  ngOnInit(): void {
    this.worlds$ = this.data.getWorlds().pipe(map(x => x.worlds));
    this.presets$ = this.data.getPresets();
    this.sharedGraphInfo$ = zip(
      this.worlds$, this.presets$, this.data.getSharedGraphs()
    ).pipe(
      map(([worlds, presets, shared]) => {
        let worldDict = normalizeArray(worlds,"id");
        let presetDict = normalizeArray(presets, "id");
        shared.forEach(x => {
          x.worldInstance = worldDict[x.world];
          x.presetInstance = presetDict[x.preset];
        });
        console.log(shared);
        return shared;
      })
    );
  }

  openGlobalPreset(preset){
    if(preset.id === "default")this.router.navigate(["/explore"])
    else this.router.navigate(["/explore"], {queryParams:{preset:preset.id}})
  }

  deletePreset(preset){    
    this.data.deletePreset(preset.id).subscribe(x => {
      this._snackBar.open(`Deleted preset ${preset.name}`,null, {duration: 5000});
      this.deletionPresetSelected = null
      this.presets$ = this.data.getPresets();
    }, err => {
      this._snackBar.open(`Deletion of preset ${preset.name} failed`,null, {duration: 5000, panelClass:'panel-error'});
      this.deletionPresetSelected = null
    });
  }

  openSelection(world, preset){
    const dialogRef = this.dialog.open(SelectionComponent, {data:{world, preset}, minWidth:"50vw"});
    dialogRef.afterClosed().subscribe(result => {
      console.log(result);
      this.router.navigate(["explore", result.world.id], {queryParams:{preset:result.preset.id}});
    });
  }

  openNewTab(parts:string[]){
    const url = this.router.serializeUrl(
      this.router.createUrlTree(parts)
    );
  
    window.open(url, '_blank');
  }

  createShareableGraph(){
    const dialogRef = this.dialog.open(ShareGraphComponent, {disableClose: true, width:"80vw"});
  }
}
