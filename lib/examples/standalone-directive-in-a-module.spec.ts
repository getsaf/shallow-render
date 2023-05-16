import { Component, Directive, NgModule } from '@angular/core';
import { Shallow } from '../shallow';

@Directive({
  standalone: true,
  selector: '[myStandaloneDirective]',
})
class MyStandaloneDirective {}

@Component({
  selector: 'my-component',
  template: '<div *myStandaloneDirective></div>',
})
class MyComponent {}

@NgModule({
  declarations: [MyComponent],
  // Import the Standalone directive directly into the module
  imports: [MyStandaloneDirective],
})
class ModuleWithStandalone {}

describe('standalone directive imported in a module', () => {
  let shallow: Shallow<ModuleWithStandalone>;

  beforeEach(() => {
    shallow = new Shallow(MyComponent, ModuleWithStandalone);
  });

  it('should successfully mock standalone directive', async () => {
    const { findStructuralDirective } = await shallow.render();

    expect(findStructuralDirective(MyStandaloneDirective)).toHaveFoundOne();
  });
});
