import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { DataService } from '@data/service/data.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-world-selection',
  templateUrl: './world-selection.component.html',
  styleUrls: ['./world-selection.component.sass']
})
export class WorldSelectionComponent implements OnInit {

  worlds$:Observable<any>;
  @Output() selectedWorld = new EventEmitter();

  constructor(private data:DataService) {     
  }

  ngOnInit(): void {
    this.worlds$ = this.data.getWorlds();
  }

}
