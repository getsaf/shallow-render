import { Component, Input, NgModule } from '@angular/core';
import { Shallow } from '../shallow';

class Foo {
  static fooify(name: string) {
    return `${name}-foo`;
  }
}
////// Module Setup //////

@Component({
  standalone: false,
  selector: 'foo',
  template: '<div>{{fooified}}</div>',
})
class FooComponent {
  @Input() name!: string;
  get fooified() {
    return Foo.fooify(this.name);
  }
}

@NgModule({
  declarations: [FooComponent],
})
class FooModule {}
//////////////////////////

describe('Mocking static methods', () => {
  let shallow: Shallow<FooComponent>;
  beforeEach(() => {
    shallow = new Shallow(FooComponent, FooModule);
  });

  it('can mock a static method on a class', async () => {
    const { element } = await shallow
      .mockStatic(Foo, { fooify: (name: string) => `${name}-MOCK FOO` })
      .render('<foo name="blah"></foo>');

    expect(element.nativeElement.textContent).toBe('blah-MOCK FOO');
  });

  it('does not mock static methods by default', async () => {
    const { element } = await shallow.render('<foo name="blah"></foo>');

    expect(element.nativeElement.textContent).toBe('blah-foo');
  });
});
