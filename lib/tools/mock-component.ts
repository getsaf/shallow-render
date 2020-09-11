import { directiveResolver } from './reflect';
import { Component, forwardRef, Type, Provider } from '@angular/core';
import { MockOf } from './mock-of.directive';
import { TestBed } from '@angular/core/testing';
import { mockWithInputsOutputsAndStubs } from './mock-with-inputs-and-outputs-and-stubs';

export const mockComponent = <TComponent extends Type<any>>(
  component: TComponent,
  config?: { stubs?: object; providerTransform?: (providers: Provider[]) => Provider[] }
): TComponent => {
  const { exportAs, selector, providers = [] } = directiveResolver.resolve(component);
  const providerTransform = (config && config.providerTransform) || (() => []);

  @MockOf(component)
  @Component({
    selector,
    template: '<ng-content></ng-content>',
    providers: [{ provide: component, useExisting: forwardRef(() => Mock) }, ...providerTransform(providers)],
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
