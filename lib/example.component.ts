import { Component, Input } from '@angular/core';
import { ExampleService } from './example.service';

@Component({
  selector: 'example',
  template: '<h1 [title]="exampleService.foo()">{{label}}</h1>',
})
export class ExampleComponent {
  @Input() label: string;
  constructor(public exampleService: ExampleService) {}
}
