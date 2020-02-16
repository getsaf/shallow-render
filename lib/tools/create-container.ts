import { Component, Type } from '@angular/core';
import { testFramework } from '../test-frameworks/test-framework';

export class ShallowRenderContainer {}

export function createContainer(template: string, bindings: any): Type<ShallowRenderContainer> {
  @Component({ template })
  class ProxyShallowContainer extends ShallowRenderContainer {
    constructor() {
      super();
      const spies = spyOnBindings(bindings);
      Object.defineProperties(
        ProxyShallowContainer.prototype,
        Object.keys(spies).reduce((acc, key) => {
          return { ...acc, [key]: { get: () => spies[key] } };
        }, {})
      );
    }
  }

  return ProxyShallowContainer;
}

const spyOnBindings = (bindings: any) => {
  Object.keys(bindings).forEach(key => {
    if (typeof bindings[key] === 'function' && !testFramework.isSpy(bindings[key])) {
      testFramework.spyOn(bindings, key);
    }
  });
  return bindings;
};
