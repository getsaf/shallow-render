import { Component, NgModule } from '@angular/core';
import { Shallow } from '../shallow';
import {
  ControlValueAccessor,
  FormsModule,
  ReactiveFormsModule,
  NG_VALUE_ACCESSOR,
  DefaultValueAccessor,
} from '@angular/forms';

////// Module Setup //////
@Component({
  selector: 'my-text',
  template: `
    <form #f="ngForm">
      <child-input name="foo" [(ngModel)]="myValue"></child-input>
    </form>
  `,
})
class MyTextComponent {
  myValue = 'blah';
}

@Component({
  selector: 'child-input',
  template: '<div></div>',
  providers: [{ provide: NG_VALUE_ACCESSOR, useClass: DefaultValueAccessor, multi: true }],
})
class ChildInputComponent implements ControlValueAccessor {
  writeValue(_obj: any): void {}
  registerOnChange(_fn: any): void {}
  registerOnTouched(_fn: any): void {}
}

@NgModule({
  declarations: [MyTextComponent, ChildInputComponent],
  imports: [FormsModule, ReactiveFormsModule],
})
class MyTextModule {}
//////////////////////////

describe('component with child that uses ControlValueAccessor', () => {
  let shallow: Shallow<MyTextComponent>;

  beforeEach(() => {
    shallow = new Shallow(MyTextComponent, MyTextModule);
  });

  it('can render mocked child component that implements ControlValueAccessor', async () => {
    const { find } = await shallow.render();

    const childInput = find(ChildInputComponent);
    expect(childInput).toHaveFoundOne();
  });
});
