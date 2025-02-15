import { Directive, Input, NgModule, TemplateRef, ViewContainerRef } from '@angular/core';
import { Shallow } from '../shallow';

////// Module Setup //////
@Directive({
  standalone: false,
  selector: '[showIfFoo]',
})
export class ShowIfFooDirective {
  constructor(
    private readonly templateRef: TemplateRef<any>,
    private readonly viewContainer: ViewContainerRef,
  ) {}

  @Input() set showIfFoo(value: string) {
    this.viewContainer.clear();
    if (value === 'foo') {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }
}

@NgModule({
  declarations: [ShowIfFooDirective],
})
class MyModule {}
//////////////////////////

describe('Structural Directive', () => {
  let shallow: Shallow<ShowIfFooDirective>;

  beforeEach(() => {
    shallow = new Shallow(ShowIfFooDirective, MyModule);
  });

  it('shows content when value is "foo"', async () => {
    const { element } = await shallow.render('<div *showIfFoo="\'foo\'">Show Me</div>');

    expect(element.nativeElement.textContent).toBe('Show Me');
  });

  it('does not show content when value is not "foo"', async () => {
    const { element } = await shallow.render('<div *showIfFoo="\'bar\'">Show Me</div>');

    expect(element).not.toBeDefined();
  });
});
