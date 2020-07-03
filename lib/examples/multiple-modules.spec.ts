import { Component, Input, NgModule } from '@angular/core';
import { Shallow } from '../shallow';

////// Module Setup //////
@Component({
  selector: 'foo',
  template: '<label>foo</label>',
})
class FooComponent {}

@NgModule({
  declarations: [FooComponent],
  exports: [FooComponent],
})
class FooModule {}

@Component({
  selector: 'bar',
  template: '<label>bar</label>',
})
class BarComponent {}

@NgModule({
  declarations: [BarComponent],
  exports: [BarComponent],
})
class BarModule {}

@Component({
  selector: 'foo-bar',
  template: `
    <foo *ngIf="showFoo"></foo>
    <bar *ngIf="showBar"></bar>
  `,
})
class FooBarComponent {
  @Input() showFoo = true;
  @Input() showBar = true;
}

@NgModule({
  imports: [FooModule, BarModule],
  declarations: [FooBarComponent],
})
class FooBarModule {}

//////////////////////////

describe('multi module', () => {
  let shallow: Shallow<FooBarComponent>;

  beforeEach(() => {
    shallow = new Shallow(FooBarComponent, FooBarModule);
  });

  it('renders a foo and a bar by default', async () => {
    const { find } = await shallow.render(`<foo-bar></foo-bar>`);

    expect(find('foo')).toHaveFound(1);
    expect(find('bar')).toHaveFound(1);
  });

  it('does not render a foo when showFoo is false', async () => {
    const { find } = await shallow.render(`<foo-bar [showFoo]="false"></foo-bar>`);

    expect(find('foo')).toHaveFound(0);
    expect(find('bar')).toHaveFound(1);
  });

  it('does not render a bar when showBar is false', async () => {
    const { find } = await shallow.render(`<foo-bar [showBar]="false"></foo-bar>`);

    expect(find('foo')).toHaveFound(1);
    expect(find('bar')).toHaveFound(0);
  });
});
