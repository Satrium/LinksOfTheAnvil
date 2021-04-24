import { Component, OnInit } from '@angular/core';
import { DataService } from '@data/service/data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.sass']
})
export class DashboardComponent implements OnInit {

  globalPresets = {};

  constructor(private data:DataService, private router:Router) { }

  ngOnInit(): void {
    // this.data.getGlobalPresets().subscribe(x => this.globalPresets = x);
  }

  openGlobalPreset(preset){
    if(preset.id === "default")this.router.navigate(["/explore"])
    else this.router.navigate(["/explore"], {queryParams:{preset:preset.id}})
  }

}
