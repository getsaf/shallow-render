import { Component, Type } from '@angular/core';
import { testFramework } from '../test-frameworks/test-framework';

export class ShallowRenderContainer {}

export function createContainer(template: string, bindings: any): Type<ShallowRenderContainer> {
  @Component({ template })
  class ProxyShallowContainerComponent extends ShallowRenderContainer {
    bindings: any;
    constructor() {
      super();
      const spies = spyOnBindings(bindings);
      this.bindings = spies;
      Object.defineProperties(
        ProxyShallowContainerComponent.prototype,
        Object.keys(spies).reduce((acc, key) => {
          return { ...acc, [key]: { get: () => this.bindings[key] } };
        }, {}),
      );
    }

    setInput(name: string, value: any): void {
      this.bindings[name] = value;
    }
  }

  return ProxyShallowContainerComponent;
}

const spyOnBindings = (bindings: any) => {
  Object.keys(bindings).forEach(key => {
    if (typeof bindings[key] === 'function' && !testFramework.isSpy(bindings[key])) {
      testFramework.spyOn(bindings, key);
    }
  });
  return bindings;
};
