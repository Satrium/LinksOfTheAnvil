import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[sidebar]'
})
export class GraphSidebarDirective {
  constructor(public template: TemplateRef<any>) {}
}