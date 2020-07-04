import { Component, NgModule } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Shallow } from '../shallow';

@Component({
  selector: 'foo',
  template: `
    <input id="name" type="text" [(ngModel)]="name" />
    <input id="nickname" type="text" [formControl]="nicknameControl" />
  `,
})
class FooComponent {
  name = 'Brandon';
  nicknameControl = new FormControl('B-ran');
}

@NgModule({
  declarations: [FooComponent],
  imports: [FormsModule, ReactiveFormsModule],
})
class FooModule {}

describe('component with forms', () => {
  let shallow: Shallow<FooComponent>;

  beforeEach(() => {
    shallow = new Shallow(FooComponent, FooModule);
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
});
