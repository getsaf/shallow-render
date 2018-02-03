import { Directive, Input } from '@angular/core';

@Directive({selector: '[exampleDirective]'})
export class ExampleDirective {
  @Input() exampleDirective: string;

  returnsInput() {
    return this.exampleDirective;
  }
}
