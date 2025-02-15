import { Component, Input, Pipe, PipeTransform } from '@angular/core';
import { Shallow } from '../shallow';

////// Component Setup //////
@Pipe({ name: 'underline' })
class UnderlinePipe implements PipeTransform {
  transform(input: string) {
    return `__${input}__`;
  }
}

@Component({
  selector: 'title-text',
  template: '<h4>{{label | underline}}</h4>',
  imports: [UnderlinePipe],
})
class TitleTextComponent {
  @Input() label!: string;
}
//////////////////////////

describe('mocking standalone pipes', () => {
  let shallow: Shallow<TitleTextComponent>;

  beforeEach(() => {
    shallow = new Shallow(TitleTextComponent);
  });

  it('displays text piped through the mocked UnderlinePipe', async () => {
    const { find } = await shallow
      .mockPipe(UnderlinePipe, input => `pipe got: ${input}`)
      .render({ bind: { label: 'woot' } });
    const h1 = find('h4');

    expect(h1.nativeElement.textContent).toBe('pipe got: woot');
  });

  it('displays text piped through the real UnderlinePipe', async () => {
    const { find } = await shallow.dontMock(UnderlinePipe).render({ bind: { label: 'woot' } });
    const h1 = find('h4');

    expect(h1.nativeElement.textContent).toBe('__woot__');
  });
});
