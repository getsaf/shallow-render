import { Component, EventEmitter, NgModule } from '@angular/core';
import { Shallow } from '../shallow';

////// Module Setup //////
@Component({
  selector: 'say-hello',
  template: `<label id="nameLabel" (click)="selected.emit(name)">Hello {{ name }}</label> `,
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['name'],
  // eslint-disable-next-line @angular-eslint/no-outputs-metadata-property
  outputs: ['selected'],
})
class HelloComponent {
  selected = new EventEmitter<string>();
}

@NgModule({
  declarations: [HelloComponent],
})
class HelloModule {}
//////////////////////////

describe('component with bindings', () => {
  let shallow: Shallow<HelloComponent>;

  beforeEach(() => {
    shallow = new Shallow(HelloComponent, HelloModule);
  });

  it('says hello to the given name', async () => {
    const { find } = await shallow.render('<say-hello [name]="\'Foo\'"></say-hello>');

    expect(find('#nameLabel').nativeElement.textContent).toBe('Hello Foo');
  });

  it('emits the name when the label is clicked', async () => {
    const { find, outputs } = await shallow.render('<say-hello [name]="\'Foo\'"></say-hello>');
    find('#nameLabel').nativeElement.click();

    expect(outputs.selected.emit).toHaveBeenCalledWith('Foo');
  });
});
