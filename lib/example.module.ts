import { NgModule } from '@angular/core';
import { ExampleComponent } from './example.component';
import { ExampleDirective } from './example.directive';
import { ExampleService } from './example.service';

@NgModule({
  declarations: [ExampleComponent, ExampleDirective],
  providers: [ExampleService],
})
export class ExampleModule {}
