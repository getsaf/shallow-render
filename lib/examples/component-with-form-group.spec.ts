import { Component, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule, Validators, FormBuilder, FormControlName } from '@angular/forms';
import { Shallow } from '../shallow';

@Component({
  standalone: false,
  selector: 'foo',
  template: `
    <form [formGroup]="formGroup">
      <input id="name" formControlName="name" />
      <input id="nickname" formControlName="nickname" />
      <custom-input id="surname" formControlName="surname"></custom-input>
    </form>
  `,
})
class FooComponent {
  formGroup = new FormBuilder().group({
    name: ['Brandon', Validators.required],
    nickname: ['', Validators.required],
    surname: ['', Validators.required],
  });
}

@Component({
  standalone: false,
  selector: 'custom-input',
  template: '<div></div>',
})
class CustomInputComponent {}

@NgModule({
  declarations: [FooComponent, CustomInputComponent],
  imports: [FormsModule, ReactiveFormsModule],
})
class FooModule {}

describe('component with formsGroup', () => {
  let shallow: Shallow<FooComponent>;

  beforeEach(() => {
    shallow = new Shallow(FooComponent, FooModule);
  });

  it('updates the name property when the input changes', async () => {
    const { find, instance, fixture } = await shallow.render();
    find('#name').nativeElement.value = 'foo';
    find('#name').nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(instance.formGroup.get('name')?.value).toBe('foo');
  });

  it('updates the nickname property when the input changes', async () => {
    const { find, instance, fixture } = await shallow.render();
    find('#nickname').nativeElement.value = 'foo';
    find('#nickname').nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(instance.formGroup.get('nickname')?.value).toBe('foo');
  });

  it('updates the surname property when the custom-input changes', async () => {
    const { findDirective, instance } = await shallow.render();
    const directive = findDirective(FormControlName, { query: '#surname' });
    directive.control.setValue('foo');

    expect(instance.formGroup.get('surname')?.value).toBe('foo');
  });
});
