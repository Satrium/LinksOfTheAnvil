import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-explore-select',
  templateUrl: './explore-select.component.html',
  styleUrls: ['./explore-select.component.sass']
})
export class ExploreSelectComponent implements OnInit {

  constructor(private router:Router) { }

  ngOnInit(): void {
  }

  selectedWorld(world){
    this.router.navigate(["explore", world.id]);
  }

}
