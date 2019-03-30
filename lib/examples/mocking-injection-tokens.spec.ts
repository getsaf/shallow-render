import { Component, Inject, InjectionToken, NgModule } from '@angular/core';
import { Shallow } from '../shallow';

////// Module Setup //////
interface CustomStyles {
  defaultLabelClass: string;
}
const STYLE_TOKEN = new InjectionToken<CustomStyles>('My custom styles');

@Component({
  selector: 'label-text',
  template: `
    <label [class]="styles.defaultLabelClass">
      <ng-content></ng-content>
    </label>
  `,
})
class LabelTextComponent {
  constructor(@Inject(STYLE_TOKEN) public styles: CustomStyles) {}
}

@NgModule({
  declarations: [LabelTextComponent],
  providers: [
    {provide: STYLE_TOKEN, useValue: {defaultLabelClass: 'uppercase font-size-small'}}
  ]
})
class LabelTextModule {}
//////////////////////////

describe('simple component example', () => {
  let shallow: Shallow<LabelTextComponent>;

  beforeEach(() => {
    shallow = new Shallow(LabelTextComponent, LabelTextModule)
      .mock(STYLE_TOKEN, {defaultLabelClass: 'MOCK-CLASS'});
  });

  it('sets the color to the configured color and size', async () => {
    const {find} = await shallow.render();

    const label = find('label');
    expect(label.nativeElement.className).toContain('MOCK-CLASS');
  });

  it('places content in a label', async () => {
    const {find} = await shallow.render('<label-text>Woot!</label-text>');

    const label = find('label');
    expect(label.nativeElement.innerText.trim()).toBe('Woot!');
  });
});
