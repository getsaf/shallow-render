import { directiveResolver } from './reflect';
import { Component, forwardRef, Type } from '@angular/core';
import { MockOf } from './mock-of.directive';
import { TestBed } from '@angular/core/testing';
import { mockWithInputsOutputsAndStubs } from './mock-base';

export const mockComponent = <TComponent extends Type<any>>(
  component: TComponent,
  config?: { stubs?: object }
): TComponent => {
  const { exportAs, selector } = directiveResolver.resolve(component);

  @MockOf(component)
  @Component({
    selector,
    template: '<ng-content></ng-content>',
    providers: [{ provide: component, useExisting: forwardRef(() => Mock) }],
    exportAs,
  })
  class Mock extends mockWithInputsOutputsAndStubs(component, config?.stubs) {}

  // Provide our mock in place of any other usage of 'thing'.
  // This makes `ViewChild` and `ContentChildren` selectors work!
  TestBed.overrideComponent(Mock, {
    add: { providers: [{ provide: component, useExisting: forwardRef(() => Mock) }] },
  });
  return Mock as any;
};
