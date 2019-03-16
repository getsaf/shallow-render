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

//////////////////////////////////////////////////////////////////
// Somewhere in your top-level test setup (maybe the karma shim?)
// This will prevent any spec from auto-mocking any service,
// component, directive or pipe.
Shallow.neverMock(RedService);
//////////////////////////////////////////////////////////////////

describe('using neverMock', () => {
  let shallow: Shallow<ColorLabelComponent>;

  beforeEach(() => {
    shallow = new Shallow(ColorLabelComponent, ColorModule);
  });

  it('Uses the color from the RedService', async () => {
    const {element} = await shallow.render('<color-label></color-label>');

    // Using the actual service response here (not mocked)
    expect(element.nativeElement.innerText).toBe('RED');
  });

  it('Uses the color from the mocked RedService', async () => {
    const {element} = await shallow
      // User mocks always override things that are 'neverMocked'
      .mock(RedService, {color: () => 'MOCKED VALUE'})
      .render('<color-label></color-label>');

    expect(element.nativeElement.innerText).toBe('MOCKED VALUE');
  });
});
