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
  selector: 'color-label',
  template: '<label>{{redService.color()}}</label>'
})
class ColorLabelComponent {
  constructor(public redService: RedService) {}
}

@NgModule({
  declarations: [ColorLabelComponent],
  providers: [RedService]
})
class ColorModule {}
//////////////////////////

class MockRedService implements RedService {
  color() {
    return 'FAKE RESPONSE';
  }
}

describe('using dontMock', () => {
  let shallow: Shallow<ColorLabelComponent>;

  beforeEach(() => {
    shallow = new Shallow(ColorLabelComponent, ColorModule).provideMock({
      provide: RedService,
      useValue: new MockRedService()
    });
  });

  it('Uses the color from the MockRedService', async () => {
    const { element } = await shallow.render();

    // Using the mocked service response here
    expect(element.nativeElement.innerText).toBe('FAKE RESPONSE');
  });
});
