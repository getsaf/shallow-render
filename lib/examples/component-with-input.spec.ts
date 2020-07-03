import { Component, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Shallow } from '../shallow';

////// Module Setup //////

@Component({
  selector: 'custom-form',
  template: '<input id="customInput" [(ngModel)]="text" />',
})
class CustomFormComponent {
  text = 'I am complete';
}

@NgModule({
  imports: [FormsModule],
  declarations: [CustomFormComponent],
})
class CustomInputModule {}
//////////////////////////

describe('component with input', () => {
  let shallow: Shallow<CustomFormComponent>;

  beforeEach(() => {
    shallow = new Shallow(CustomFormComponent, CustomInputModule);
  });

  it('displays an input with default value', async () => {
    const { find } = await shallow.render();

    expect(find('#customInput').nativeElement.value).toBe('I am complete');
  });

  it('input updates ngModel', async () => {
    const { find, instance } = await shallow.render();

    const input = find('#customInput');
    input.nativeElement.value = 'It works!';
    input.triggerEventHandler('input', { target: input.nativeElement });

    expect(instance.text).toBe('It works!');
  });
});
