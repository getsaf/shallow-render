import { Component, Type } from '@angular/core';
import { testFramework } from '../test-frameworks/test-framework';

export class ShallowRenderContainer {}

export function createContainer(template: string, bindings: any): Type<ShallowRenderContainer> {
  @Component({ template })
  class ProxyShallowContainerComponent extends ShallowRenderContainer {
    private bindings: any;
    constructor() {
      super();
      this.bindings = spyOnBindings(bindings);
      Object.defineProperties(
        ProxyShallowContainerComponent.prototype,
        Object.keys(this.bindings).reduce((acc, key) => {
          return { ...acc, [key]: { get: () => this.bindings[key] } };
        }, {}),
      );
    }

    updateBinding(name: string, value: any): void {
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
