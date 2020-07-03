///////////////////////////////////////////////////////////////////
// APP_INITIALIZERS blow up TestBed!
// until https://github.com/angular/angular/issues/24218 is fixed
///////////////////////////////////////////////////////////////////
import { APP_INITIALIZER, Component, NgModule } from '@angular/core';
import { Shallow } from '../shallow';

////// Module Setup //////
@Component({
  selector: 'foo',
  template: '<label>foo</label>',
})
class FooComponent {}

@NgModule({
  declarations: [FooComponent],
  providers: [{ provide: APP_INITIALIZER, multi: true, useFactory: () => undefined }],
})
class FooLabelModule {}
//////////////////////////

describe('using an APP_INITIALIZER', () => {
  let shallow: Shallow<FooComponent>;

  beforeEach(() => {
    shallow = new Shallow(FooComponent, FooLabelModule);
  });

  it('does not blow up', async () => {
    await shallow.render();
    expect(true).toBe(true);
  });
});
