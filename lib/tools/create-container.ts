import { Component, Type } from '@angular/core';
import { Shallow } from '../shallow';

const spyOnBindings = (bindings: any) => {
  Object.keys(bindings).forEach(key => {
    if (typeof bindings[key] === 'function' && !Shallow.testFramework.isSpy(bindings[key])) {
      Shallow.testFramework.spyOn(bindings, key);
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
