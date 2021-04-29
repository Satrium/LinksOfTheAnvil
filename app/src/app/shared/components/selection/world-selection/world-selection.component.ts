import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DataService } from '@data/service/data.service';
import { World } from '@global/worldanvil/world';
import { Observable } from 'rxjs/internal/Observable';

@Component({
  selector: 'app-world-selection',
  templateUrl: './world-selection.component.html',
  styleUrls: ['./world-selection.component.sass']
})
export class WorldSelectionComponent implements OnInit {

  @Output()
  select = new EventEmitter<World>();

  @Input()
  worlds$:Observable<World[]>

  constructor() { }

  ngOnInit(): void { }

  selected(world:World){
    this.select.emit(world);
  }

}
