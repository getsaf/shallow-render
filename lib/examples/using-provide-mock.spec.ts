import { Component, Injectable, NgModule } from '@angular/core';
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
  providers: [RedService],
})
class ColorModule {}
//////////////////////////

class MockRedService implements RedService {
  constructor(private _color: string) {}
  color() {
    return this._color;
  }
}

describe('using provideMock', () => {
  let shallow: Shallow<ColorLabelComponent>;

  beforeEach(() => {
    shallow = new Shallow(ColorLabelComponent, ColorModule).provideMock({
      provide: RedService,
      useValue: new MockRedService('Mocked Red'),
    });
  });

  it('Uses the color from the MockRedService', async () => {
    const { element } = await shallow
      // Provider mocks can be stacked by providing the mock again.
      // The last mock wins!
      .provideMock({
        provide: RedService,
        useValue: new MockRedService('BAR'),
      })
      .render();

    // Using the mocked service response here
    expect(element.nativeElement.textContent).toBe('BAR');
  });
});
