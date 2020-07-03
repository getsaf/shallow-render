import { Component, Inject, InjectionToken, NgModule } from '@angular/core';
import { Shallow } from '../shallow';

////// Module Setup //////
interface CustomStyles {
  defaultLabelClass: string;
}
const STYLE_TOKEN = new InjectionToken<CustomStyles>('My custom styles');
const STRING_TOKEN = new InjectionToken<string>('My string token');
const FUNCTION_TOKEN = new InjectionToken<() => string>('My function token');

@Component({
  selector: 'label-text',
  template: `
    <span id="token-string">{{ stringToken }}</span>
    <span id="token-function">{{ functionToken() }}</span>
    <label [class]="stylesToken.defaultLabelClass">
      <ng-content></ng-content>
    </label>
  `,
})
class LabelTextComponent {
  constructor(
    @Inject(STYLE_TOKEN) public stylesToken: CustomStyles,
    @Inject(STRING_TOKEN) public stringToken: string,
    @Inject(FUNCTION_TOKEN) public functionToken: () => string
  ) {}
}

@NgModule({
  declarations: [LabelTextComponent],
  providers: [
    { provide: STYLE_TOKEN, useValue: { defaultLabelClass: 'uppercase font-size-small' } },
    { provide: STRING_TOKEN, useValue: 'FOO' },
    { provide: FUNCTION_TOKEN, useValue: () => 'BAR' },
  ],
})
class LabelTextModule {}
//////////////////////////

describe('simple component example', () => {
  let shallow: Shallow<LabelTextComponent>;

  beforeEach(() => {
    shallow = new Shallow(LabelTextComponent, LabelTextModule)
      .mock(STYLE_TOKEN, { defaultLabelClass: 'MOCK-CLASS' })
      .mock(STRING_TOKEN, 'MOCK-STRING')
      .mock(FUNCTION_TOKEN, () => 'MOCK-FUNCTION');
  });

  it('sets the color to the configured color and size', async () => {
    const { find } = await shallow.render();

    const label = find('label');
    expect(label.nativeElement.className).toContain('MOCK-CLASS');
  });

  it('places content in a label', async () => {
    const { find } = await shallow.render('<label-text>Woot!</label-text>');

    const label = find('label');
    expect(label.nativeElement.innerText.trim()).toBe('Woot!');
  });

  it('renders the string token', async () => {
    const { find } = await shallow.render();

    expect(find('#token-string').nativeElement.innerText).toBe('MOCK-STRING');
  });

  it('renders the results of the function token', async () => {
    const { find } = await shallow.render();

    expect(find('#token-function').nativeElement.innerText).toBe('MOCK-FUNCTION');
  });
});
