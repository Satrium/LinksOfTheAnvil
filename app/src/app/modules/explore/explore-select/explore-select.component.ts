import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService } from '@data/service/data.service';
import { World } from '@global/worldanvil/world';
import { Observable } from 'rxjs/internal/Observable';

@Component({
  selector: 'app-explore-select',
  templateUrl: './explore-select.component.html',
  styleUrls: ['./explore-select.component.sass']
})
export class ExploreSelectComponent implements OnInit {

  worlds$:Observable<World[]>;
  private preset;

  constructor(private router:Router, private active:ActivatedRoute, private data:DataService) { }

  ngOnInit(): void {
    this.worlds$ = this.data.getWorlds();
    this.active.queryParams.subscribe(x => this.preset = x["preset"]);
  }

  selectedWorld(world){
    if(this.preset){
      this.router.navigate(["explore", world.id],{queryParams:{"preset":this.preset}});
    }else{
      this.router.navigate(["explore", world.id]);
    }
    
  }

}
