import { Input, Component, NgModule, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Shallow } from './shallow';
/* This spec is really only here because Angular Forms directives can be
 * weird and have given the mocking libs some trouble in the past. This spec
 * really just ensures that we don't inadvertantly break reactive-forms with
 * any code changes.
 * */

////// Module Setup //////
@Component({
  selector: 'name',
  template: '<input [formControl]="name"/>',
})
class NameComponent implements OnInit {
  @Input() initialValue: string;
  name = new FormControl('');

  ngOnInit() {
    this.name.setValue(this.initialValue);
  }
}

@NgModule({
  imports: [ReactiveFormsModule],
  declarations: [NameComponent],
})
class NameModule {}
//////////////////////////

describe('shallow with reactive forms module', () => {
  let shallow: Shallow<NameComponent>;

  beforeEach(() => {
    shallow = new Shallow(NameComponent, NameModule);
  });

  it('can be used with ReactiveFormsModule directives', async () => {
    const {instance} = await shallow.render('<name initialValue="foo"></name>');

    expect(instance.name.value).toBe('foo');
  });
});
