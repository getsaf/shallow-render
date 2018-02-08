import { Component, NgModule } from '@angular/core';
import { Shallow } from '../shallow';

////// Module Setup //////
@Component({
  selector: 'big-text',
  template: '<h1><ng-content></ng-content></h1>',
})
class BigTextComponent {}

@NgModule({
  declarations: [BigTextComponent]
})
class BigTextModule {}
//////////////////////////

describe('simple component example', () => {
  const shallow = new Shallow(BigTextComponent, BigTextModule);

  it('places content in an h1', async () => {
    const {find} = await shallow.render('<big-text>Woot!</big-text>');

    const h1 = find('h1');
    expect(h1.nativeElement.innerText).toBe('Woot!');
  });
});
