import { Component, Injectable, NgModule } from '@angular/core';
import { Shallow } from '../shallow';

@Injectable()
class MyService {
  public getValue() {
    return 'SERVICE VALUE';
  }
}

@NgModule({
  providers: [MyService],
})
class MyServiceModule {}

@Component({
  selector: 'my-standalone',
  template: '<h1>It worked {{myService.getValue()}}</h1>',
  imports: [MyServiceModule],
})
class MyStandaloneComponent {
  constructor(public myService: MyService) {}
}

@Component({
  standalone: false,
  selector: 'my-component',
  template: '<my-standalone></my-standalone>',
})
class MyComponent {}

@NgModule({
  declarations: [MyComponent],
  // Import the Standalone component directly into the module
  imports: [MyStandaloneComponent],
})
class ModuleWithStandalone {}

describe('standalone component imported in a module', () => {
  let shallow: Shallow<ModuleWithStandalone>;

  beforeEach(() => {
    shallow = new Shallow(MyComponent, ModuleWithStandalone);
  });

  it('can use mocked standalone components', async () => {
    const { find } = await shallow.dontMock(MyService).render();

    expect(find(MyStandaloneComponent)).toHaveFoundOne();
  });

  it('can mock services used in the component', async () => {
    const { find } = await shallow
      .dontMock(MyStandaloneComponent)
      .mock(MyService, { getValue: () => 'MOCK VALUE' })
      .render();

    expect(find('h1').nativeElement.textContent).toBe('It worked MOCK VALUE');
  });
});
