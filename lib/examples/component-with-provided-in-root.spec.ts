import { Component, Injectable, NgModule } from '@angular/core';
import { Shallow } from '../shallow';

////// Module Setup //////
@Injectable({ providedIn: 'root' })
class RootService {
  getRootName() {
    return 'MY-ROOT-NAME';
  }
}

@Component({
  selector: 'root-label',
  template: '<label>{{rootService.getRootName()}}</label>',
})
class RootLabelComponent {
  constructor(public rootService: RootService) {}
}

@NgModule({
  declarations: [RootLabelComponent],
})
class RootLabelModule {}
//////////////////////////

describe('component with service providedIn root', () => {
  let shallow: Shallow<RootLabelComponent>;

  beforeEach(() => {
    shallow = new Shallow(RootLabelComponent, RootLabelModule).mock(RootService, {
      getRootName: () => 'MOCKED ROOT NAME',
    });
  });

  it('Uses the rootName from the RootService', async () => {
    const { element } = await shallow.render();

    expect(element.nativeElement.innerText).toBe('MOCKED ROOT NAME');
  });
});
