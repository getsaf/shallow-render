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
class MyModule {}

@Component({
  selector: 'my-standalone',
  template: '<h1>It worked {{myService.getValue()}}</h1>',
  imports: [MyModule],
})
class MyStandaloneComponent {
  constructor(public myService: MyService) {}
}

describe('standalone component', () => {
  let shallow: Shallow<MyStandaloneComponent>;

  beforeEach(() => {
    shallow = new Shallow(MyStandaloneComponent);
  });

  it('can use services provided in imported modules', async () => {
    const { find } = await shallow.dontMock(MyService).render();

    expect(find('h1').nativeElement.textContent).toBe('It worked SERVICE VALUE');
  });

  it('can mock services from imported modules', async () => {
    const { find } = await shallow.mock(MyService, { getValue: () => 'MOCK VALUE' }).render();

    expect(find('h1').nativeElement.textContent).toBe('It worked MOCK VALUE');
  });
});
