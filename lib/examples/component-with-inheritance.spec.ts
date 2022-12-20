import { Component, EventEmitter, Input, NgModule, Output } from '@angular/core';
import { Shallow } from '../shallow';

////// Module Setup //////
class BaseComponent {
  @Input() baseInput!: string;
  @Output() baseOutput = new EventEmitter<string>();
}

@Component({
  selector: 'test-component',
  template: `
    <label id="baseInput" (click)="baseOutput.emit(baseInput)">{{ baseInput }}</label>
    <label id="extendedInput" (click)="extendedOutput.emit(extendedInput)">{{ extendedInput }}</label>
  `,
})
class ExtendedComponent extends BaseComponent {
  @Input() extendedInput!: string;
  @Output() extendedOutput = new EventEmitter<string>();
}

@NgModule({
  declarations: [ExtendedComponent],
})
class InheritanceModule {}
//////////////////////////

describe('component with bindings', () => {
  let shallow: Shallow<ExtendedComponent>;

  beforeEach(() => {
    shallow = new Shallow(ExtendedComponent, InheritanceModule);
  });

  it('binds to with inherited inputs', async () => {
    const { find, fixture, bindings } = await shallow.render({
      bind: {
        baseInput: 'the base input',
        extendedInput: 'the extended input',
      },
    });

    const baseInput = find('#baseInput');
    const extendedInput = find('#extendedInput');
    expect(baseInput.nativeElement.textContent).toEqual('the base input');
    expect(extendedInput.nativeElement.textContent).toEqual('the extended input');

    bindings.baseInput = 'new base input';
    bindings.extendedInput = 'new extended input';
    fixture.detectChanges();

    expect(baseInput.nativeElement.textContent).toEqual('new base input');
    expect(extendedInput.nativeElement.textContent).toEqual('new extended input');
  });

  it('binds to with inherited outputs', async () => {
    const { find, outputs } = await shallow.render({
      bind: {
        baseInput: 'the base input',
        extendedInput: 'the extended input',
      },
    });

    find('#baseInput').triggerEventHandler('click');
    find('#extendedInput').triggerEventHandler('click');

    expect(outputs.baseOutput.emit).toHaveBeenCalledWith('the base input');
    expect(outputs.extendedOutput.emit).toHaveBeenCalledWith('the extended input');
  });
});
