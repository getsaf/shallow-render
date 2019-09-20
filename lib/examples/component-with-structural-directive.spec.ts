import { Component, Directive, Input, NgModule } from '@angular/core';
import { Shallow } from '../shallow';

////// Module Setup //////
@Component({
  selector: 'heading',
  template: `
    <h1 *myStructuralDirective="'first'">Hi there!</h1>
    <h1 *myStructuralDirective="'second'">Hi there!</h1>
  `,
})
class HeadingComponent {}

@Directive({
  selector: '[myStructuralDirective]',
})
class MyStructuralDirective {
  @Input() myStructuralDirective: string;
}

@NgModule({
  declarations: [HeadingComponent, MyStructuralDirective]
})
class HeadingModule {}
//////////////////////////

describe('component with structural directive', () => {
  let shallow: Shallow<HeadingComponent>;

  beforeEach(() => {
    shallow = new Shallow(HeadingComponent, HeadingModule);
  });

  it('renders both headings', async () => {
    const {find} = await shallow
      .withStructuralDirective(MyStructuralDirective)
      .render();

    expect(find('h1')).toHaveFound(2);
  });

  it('renders the second heading', async () => {
    const {find, findStructuralDirective, renderStructuralDirective} = await shallow.render();
    const found = findStructuralDirective(
      MyStructuralDirective,
      {query: d => d.myStructuralDirective === 'first'}
    );
    renderStructuralDirective(found);

    expect(find('h1')).toHaveFoundOne();
  });

  it('unrenders the heading', async () => {
    const {find, renderStructuralDirective} = await shallow
      .withStructuralDirective(MyStructuralDirective)
      .render();
    renderStructuralDirective(MyStructuralDirective, false);

    expect(find('h1')).toHaveFound(0);
  });
});
