import { Component, EventEmitter, NgModule, Output } from '@angular/core';
import { Shallow } from '../shallow';

////// Module Setup //////

interface MyEvent {
  id: number;
  name: string;
}

@Component({
  selector: 'inner-component',
  template: `
    <p>Hello</p>
  `
})
class InnerComponent {
  @Output() output = new EventEmitter<MyEvent>();
}
@Component({
  selector: 'outer-component',
  template: `
    <inner-component (output)="outputHandler($event)"></inner-component>
  `
})
class OuterComponent {
  outputHandler(_event: MyEvent) {
    // implementation
  }
}

@NgModule({
  declarations: [InnerComponent, OuterComponent]
})
class CustomInputModule {}
//////////////////////////

describe('component with output', () => {
  let shallow: Shallow<OuterComponent>;

  beforeEach(() => {
    shallow = new Shallow(OuterComponent, CustomInputModule);
  });

  it('displays an inner component', async () => {
    const { find } = await shallow.render();

    expect(find('inner-component')).toHaveFound(1);
  });

  it('input updates ngModel', async () => {
    const { find, instance } = await shallow.render();
    spyOn(instance, 'outputHandler');

    const innerComponent = find('inner-component');
    innerComponent.triggerEventHandler('output', { id: 1, name: 'myEvent' } as MyEvent);

    expect(instance.outputHandler).toHaveBeenCalledWith({ id: 1, name: 'myEvent' });
  });
});
