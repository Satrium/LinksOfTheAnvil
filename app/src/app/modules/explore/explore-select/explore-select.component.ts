import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-explore-select',
  templateUrl: './explore-select.component.html',
  styleUrls: ['./explore-select.component.sass']
})
export class ExploreSelectComponent implements OnInit {

  private preset;

  constructor(private router:Router, private active:ActivatedRoute) { }

  ngOnInit(): void {
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
