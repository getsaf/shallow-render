import { Component, Injectable, NgModule } from '@angular/core';
import { Shallow } from '../shallow';

/////// Global Service Module ///////
// This service is provided globally via a ServiceModule
@Injectable()
class RedService {
  color() {
    return 'RED';
  }
}

@NgModule({ providers: [RedService] })
class ServiceModule {}
/////////////////////////////////////

////// Module Setup //////
@Component({
  standalone: false,
  selector: 'color-label',
  template: '<label>{{redService.color()}}</label>',
})
class ColorLabelComponent {
  constructor(public redService: RedService) {}
}

@NgModule({ declarations: [ColorLabelComponent] })
class ColorModule {}
//////////////////////////

//////////////////////////////////////////////////////////////////
// Somewhere in your top-level test setup (maybe the karma shim?)
// This will import (and mock!) the ServiceModule in ALL shallow test modules
Shallow.alwaysImport(ServiceModule).neverMock(RedService); // Without this line, the RedService will be auto-mocked
//////////////////////////////////////////////////////////////////

describe('alwaysImport', () => {
  let shallow: Shallow<ColorLabelComponent>;

  beforeEach(() => {
    shallow = new Shallow(ColorLabelComponent, ColorModule);
  });

  it('Uses the color from the RedService', async () => {
    const { element } = await shallow.render('<color-label></color-label>');

    // Using the actual service response here (not mocked)
    expect(element.nativeElement.textContent).toBe('RED');
  });

  it('Uses the color from the mocked RedService', async () => {
    const { element } = await shallow
      // User mocks always override things that are 'neverMocked'
      .mock(RedService, { color: () => 'MOCKED VALUE' })
      .render('<color-label></color-label>');

    expect(element.nativeElement.textContent).toBe('MOCKED VALUE');
  });
});
