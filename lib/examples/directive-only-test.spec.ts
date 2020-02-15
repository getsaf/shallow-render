import { Directive, ElementRef, Input, NgModule } from '@angular/core';
import { Shallow } from '../shallow';

////// Module Setup //////
@Directive({
  selector: '[red]'
})
class RedDirective {
  @Input() tooltip!: string;
  constructor(el: ElementRef) {
    el.nativeElement.style.backgroundColor = 'red';
  }
}

@NgModule({
  declarations: [RedDirective]
})
class RedModule {}
//////////////////////////

describe('RedDirective', () => {
  let shallow: Shallow<RedDirective>;

  beforeEach(() => {
    shallow = new Shallow(RedDirective, RedModule);
  });

  it('makes the background color red', async () => {
    const { element } = await shallow.render('<div red></div>');

    expect(element.nativeElement.style.backgroundColor).toBe('red');
  });
});
