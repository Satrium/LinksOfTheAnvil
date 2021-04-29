import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[appSelectionActions]'
})
export class SelectionButtonsDirective {

  constructor(public template: TemplateRef<any>) { }

}
