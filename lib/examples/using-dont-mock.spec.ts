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

describe('using dontMock', () => {
  let shallow: Shallow<ColorLabelComponent>;

  beforeEach(() => {
    shallow = new Shallow(ColorLabelComponent, ColorModule);
  });

  it('Uses the color from the RedService', async () => {
    const { element } = await shallow.dontMock(RedService).render('<color-label></color-label>');

    // Using the actual service response here (not mocked)
    expect(element.nativeElement.innerText).toBe('RED');
  });
});
