import { Component, Input, NgModule, Pipe, PipeTransform } from '@angular/core';
import { Shallow } from '../shallow';

////// Module Setup //////
@Component({
  selector: 'title-text',
  template: '<h4>{{label | underline}}</h4>'
})
class TitleTextComponent {
  @Input() label!: string;
}

@Pipe({
  name: 'underline'
})
class UnderlinePipe implements PipeTransform {
  transform(input: string) {
    return `__${input}__`;
  }
}

@NgModule({
  declarations: [TitleTextComponent, UnderlinePipe]
})
class TitleTextModule {}
//////////////////////////

describe('simple component example', () => {
  let shallow: Shallow<TitleTextComponent>;

  beforeEach(() => {
    shallow = new Shallow(TitleTextComponent, TitleTextModule);
  });

  it('displays text piped through the HighlightPipe', async () => {
    const { find } = await shallow
      .mockPipe(UnderlinePipe, input => `pipe got: ${input}`)
      .render({ bind: { label: 'woot' } });

    const h1 = find('h4');
    expect(h1.nativeElement.innerText).toBe('pipe got: woot');
  });
});
