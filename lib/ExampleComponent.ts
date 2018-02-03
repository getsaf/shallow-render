import { Component, Input } from '@angular/core';

@Component({
  selector: 'example',
  template: '<h1>{{label}}</h1>',
})
export class ExampleComponent {
  @Input() label: string;
}
