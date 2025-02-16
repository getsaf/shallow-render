import { Component, Injectable, ModuleWithProviders, NgModule } from '@angular/core';
import { Shallow } from '../shallow';

////// Module Setup //////
@Injectable()
class RedService {
  color() {
    return 'RED';
  }
}

@Component({
  standalone: false,
  selector: 'color-label',
  template: '<label>{{redService.color()}}</label>',
})
class ColorLabelComponent {
  constructor(public redService: RedService) {}
}

@NgModule({
  declarations: [ColorLabelComponent],
})
class ColorModule {
  static forRoot(): ModuleWithProviders<ColorModule> {
    return {
      ngModule: ColorModule,
      providers: [RedService],
    };
  }
}
//////////////////////////

describe('module with forRoot', () => {
  let shallow: Shallow<ColorLabelComponent>;

  beforeEach(() => {
    shallow = new Shallow(ColorLabelComponent, ColorModule.forRoot()).mock(RedService, { color: () => 'MOCKED COLOR' });
  });

  it('Uses the color from the RedService', async () => {
    const { element } = await shallow.render();

    expect(element.nativeElement.textContent).toBe('MOCKED COLOR');
  });
});
