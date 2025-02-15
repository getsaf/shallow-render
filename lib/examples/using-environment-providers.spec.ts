import { Component, Injectable, makeEnvironmentProviders, NgModule } from '@angular/core';
import { Shallow } from '../shallow';

////// Module Setup //////
@Injectable()
class EnvironmentService {
  getValue() {
    return 'Original value';
  }
}

@Component({
  standalone: false,
  selector: 'my-component',
  template: '<h1>{{envService.getValue()}}</h1>',
  providers: [],
})
class MyComponent {
  constructor(public envService: EnvironmentService) {}
}

@NgModule({
  declarations: [MyComponent],
  exports: [MyComponent],
  providers: [makeEnvironmentProviders([EnvironmentService])],
})
class MyModule {}
//////////////////////////

describe('environment providers', () => {
  let shallow: Shallow<MyComponent>;

  beforeEach(() => {
    shallow = new Shallow(MyComponent, MyModule);
  });

  it('renders the value from the EnvironmentService', async () => {
    const { find } = await shallow.dontMock(EnvironmentService).render();

    expect(find('h1').nativeElement.textContent).toContain('Original value');
  });

  it('renders the mocked value from the EnvironmentService', async () => {
    const { find } = await shallow.mock(EnvironmentService, { getValue: () => 'Mocked value' }).render();

    expect(find('h1').nativeElement.textContent).toContain('Mocked value');
  });
});
