import { Component, Type } from '@angular/core';
import { testFramework } from '../test-framework';

const spyOnBindings = (bindings: any) => {
  Object.keys(bindings).forEach(key => {
    if (typeof bindings[key] === 'function' && !testFramework.isSpy(bindings[key])) {
      testFramework.spyOn(bindings, key);
    }
  });
  return bindings;
};

export class ShallowRenderContainer {}

export function createContainer(template: string, bindings: any): Type<ShallowRenderContainer> {
  @Component({template})
  class ProxyShallowContainer extends ShallowRenderContainer {}
  ProxyShallowContainer.prototype = spyOnBindings(bindings);

  return ProxyShallowContainer;
}
