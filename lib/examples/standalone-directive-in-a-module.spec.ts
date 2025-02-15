import { Component, Directive, NgModule } from '@angular/core';
import { Shallow } from '../shallow';

@Directive({
  selector: '[myStandaloneDirective]',
})
class MyStandaloneDirective {}

@Component({
  standalone: false,
  selector: 'my-component',
  template: '<div *myStandaloneDirective></div>',
  imports: [MyStandaloneDirective],
})
class MyComponent {}

@NgModule({
  // Import the Standalone directive directly into the module
  imports: [MyStandaloneDirective],
})
class ModuleWithStandalone {}

describe('standalone directive imported in a module', () => {
  let shallow: Shallow<MyComponent>;

  beforeEach(() => {
    shallow = new Shallow(MyComponent, ModuleWithStandalone);
  });

  it('should successfully mock standalone directive', async () => {
    const { findStructuralDirective } = await shallow.render();

    expect(findStructuralDirective(MyStandaloneDirective)).toHaveFoundOne();
  });
});
