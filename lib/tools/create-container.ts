import { Component, Type } from '@angular/core';

const spyOnBindings = (bindings: any) => {
  Object.keys(bindings).forEach(key => {
    if (typeof bindings[key] === 'function') {
      spyOn(bindings, key).and.callThrough();
    }
  });
  return bindings;
};

export class ShallowRenderContainer {}

export function createContainer(template: string, bindings: any): Type<ShallowRenderContainer> {
  @Component({template})
  class ProxyShallowContainer extends ShallowRenderContainer {}
  Object.assign(ProxyShallowContainer.prototype, spyOnBindings(bindings));

  return ProxyShallowContainer;
}

