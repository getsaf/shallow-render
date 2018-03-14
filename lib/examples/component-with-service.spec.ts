import { Injectable, Component, NgModule } from '@angular/core';
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

describe('component with service', () => {
  const shallow = new Shallow(ColorLabelComponent, ColorModule)
    .mock(RedService, {color: () => 'MOCKED COLOR'});

  it('Uses the color from the RedService', async () => {
    const {element} = await shallow.render('<color-label></color-label>');

    expect(element.nativeElement.innerText).toBe('MOCKED COLOR');
  });
});
