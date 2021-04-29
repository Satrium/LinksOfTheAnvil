import { AfterViewInit, Component, ContentChild, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { DataService } from '@data/service/data.service';
import { Preset } from '@global/graph.config';
import { Observable } from 'rxjs/internal/Observable';
import { SelectionButtonsDirective } from '../selection-buttons.directive';

@Component({
  selector: 'app-preset-selection',
  templateUrl: './preset-selection.component.html',
  styleUrls: ['./preset-selection.component.sass']
})
export class PresetSelectionComponent implements OnInit {

  @ContentChild(SelectionButtonsDirective) actionsTemplate;
  @Output()
  select = new EventEmitter<Preset>();

  @Input()
  displayedColumns: string[] = ['owner', 'name', 'description', 'actions'];

  @Input()
  presets$: Observable<Preset[]>;

  constructor() { }


  ngOnInit(): void { }

  selected(preset:Preset){
    this.select.emit(preset);
  }


}
