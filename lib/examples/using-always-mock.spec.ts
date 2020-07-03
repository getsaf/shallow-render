import { Component, Injectable, NgModule } from '@angular/core';
import { Shallow } from '../shallow';

////// Module Setup //////
@Injectable()
class TitleService {
  getTitle() {
    return 'My Application';
  }
}

@Component({
  selector: 'app-title',
  template: '<h1>{{titleService.getTitle()}}</h1>',
})
class AppTitleComponent {
  constructor(public titleService: TitleService) {}
}

@NgModule({
  declarations: [AppTitleComponent],
  exports: [AppTitleComponent],
  providers: [TitleService],
})
class TitleModule {}

// In your Karma test shim:
Shallow.alwaysMock(TitleService, { getTitle: () => 'Always mocked' });

//////////////////////////

describe('alwaysMock', () => {
  let shallow: Shallow<AppTitleComponent>;

  beforeEach(() => {
    shallow = new Shallow(AppTitleComponent, TitleModule);
  });

  it('renders the title from the title service', async () => {
    const { find } = await shallow.render(`<app-title></app-title>`);

    expect(find('h1').nativeElement.innerText).toContain('Always mocked');
  });
});
