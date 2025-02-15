import { Component, EventEmitter, Input, NgModule, Output } from '@angular/core';
import { Shallow } from '../shallow';

////// Module Setup //////
@Component({
  standalone: false,
  selector: 'name',
  template: '<label (click)="selected.emit(name)">{{name}}</label>',
})
class NameComponent {
  @Input() name = 'DEFAULT NAME';
  @Output() selected = new EventEmitter<string>();
}

@NgModule({
  declarations: [NameComponent],
})
class NameModule {}
//////////////////////////

describe('No-Template Rendering', () => {
  let shallow: Shallow<NameComponent>;

  beforeEach(() => {
    shallow = new Shallow(NameComponent, NameModule);
  });

  it('displays and tracks the name', async () => {
    const { find, outputs } = await shallow.render({
      bind: { name: 'Chuck Norris' },
    });
    const label = find('label');
    label.nativeElement.click();

    expect(label.nativeElement.textContent).toBe('Chuck Norris');
    expect(outputs.selected.emit).toHaveBeenCalledWith('Chuck Norris');
  });

  it('uses the default name', async () => {
    const { find, outputs } = await shallow.render();

    find('label').nativeElement.click();
    expect(outputs.selected.emit).toHaveBeenCalledWith('DEFAULT NAME');
  });
});
