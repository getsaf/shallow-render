import { reflect } from './reflect';
import { Component, forwardRef, Type } from '@angular/core';
import { MockOf } from './mock-of.directive';
import { TestBed } from '@angular/core/testing';
import { mockWithInputsOutputsAndStubs } from './mock-with-inputs-and-outputs-and-stubs';
import { NG_VALUE_ACCESSOR, DefaultValueAccessor } from '@angular/forms';

export const mockComponent = <TComponent extends Type<any>>(
  component: TComponent,
  config?: { stubs?: object }
): TComponent => {
  const { selector, standalone, exportAs } = reflect.resolveComponent(component);

  @MockOf(component)
  @Component({
    selector,
    template: '<ng-content></ng-content>',
    standalone,
    providers: [
      { provide: component, useExisting: forwardRef(() => MockComponent) },
      { provide: NG_VALUE_ACCESSOR, useClass: DefaultValueAccessor, multi: true },
    ],
    exportAs,
  })
  class MockComponent extends mockWithInputsOutputsAndStubs(component, config?.stubs) {}

  // Provide our mock in place of any other usage of 'thing'.
  // This makes `ViewChild` and `ContentChildren` selectors work!
  TestBed.overrideComponent(MockComponent, {
    add: { providers: [{ provide: component, useExisting: forwardRef(() => MockComponent) }] },
  });
  return MockComponent as any;
};
