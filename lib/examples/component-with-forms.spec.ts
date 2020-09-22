import { Component, NgModule } from '@angular/core';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  NG_VALUE_ACCESSOR,
  DefaultValueAccessor,
  NgModel,
} from '@angular/forms';
import { Shallow } from '../shallow';

@Component({
  selector: 'foo',
  template: `
    <input id="name" type="text" [(ngModel)]="name" />
    <input id="nickname" type="text" [formControl]="nicknameControl" />
    <custom-input id="surname" [(ngModel)]="surname"></custom-input>
  `,
})
class FooComponent {
  name = 'Brandon';
  nicknameControl = new FormControl('B-ran');
  surname = 'Domingue';
}

@Component({
  selector: 'custom-input',
  template: '<div></div>',
  providers: [{ provide: NG_VALUE_ACCESSOR, useClass: DefaultValueAccessor, multi: true }],
})
class CustomInputComponent {}

@NgModule({
  declarations: [FooComponent, CustomInputComponent],
  imports: [FormsModule, ReactiveFormsModule],
})
class FooModule {}

describe('component with forms', () => {
  let shallow: Shallow<FooComponent>;

  beforeEach(() => {
    shallow = new Shallow(FooComponent, FooModule).provideMock({
      provide: NG_VALUE_ACCESSOR,
      useClass: DefaultValueAccessor,
      multi: true,
    });
  });

  it('updates the name property when the input changes', async () => {
    const { find, instance, fixture } = await shallow.render();
    find('#name').nativeElement.value = 'foo';
    find('#name').nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(instance.name).toBe('foo');
  });

  it('updates the nickname property when the input changes', async () => {
    const { find, instance, fixture } = await shallow.render();
    find('#nickname').nativeElement.value = 'foo';
    find('#nickname').nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(instance.nicknameControl.value).toBe('foo');
  });

  it('updates the surname property when the custom-input changes', async () => {
    const { findDirective, instance } = await shallow.render();
    const directive = findDirective(NgModel, { query: '#surname' });
    directive.update.emit('foo');

    expect(instance.surname).toBe('foo');
  });
});
