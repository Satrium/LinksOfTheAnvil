import { Component, OnInit } from '@angular/core';
import { DataService } from '@data/service/data.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Preset } from '@global/graph.config';
import { map } from 'rxjs/operators';
import { World } from '@global/worldanvil/world';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.sass']
})
export class DashboardComponent implements OnInit {

  globalPresets = [];

  worlds$:Observable<World[]>

  presets$: Observable<Preset[]>;
  globalPresets$: Observable<Preset[]>;
  userPresets$: Observable<Preset[]>;

  deletionPresetSelected: string;

  displayedColumns: string[] = ['owner', 'name', 'description', 'actions'];

  constructor(private data:DataService, private router:Router, private _snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.worlds$ = this.data.getWorlds();
    this.presets$ = this.data.getPresets();
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
}
