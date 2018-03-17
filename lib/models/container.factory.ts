import { Component, Type } from '@angular/core';

const spyOnMethods = <TObj>(obj: TObj): TObj => {
  const anyObj = obj as any;
  Object.keys(anyObj).forEach(key => {
    const value = anyObj[key];
    if (typeof value === 'function') {
      spyOn(anyObj, key).and.callThrough();
    } else if (typeof value === 'object') {
      // NOTE: Recursion, too dangerous? Possible endless-loops
      // if a child referneces it's parent.
      spyOnMethods(value);
    }
  });
  return obj;
};

export class ShallowRenderContainer {}

export function createContainerComponent(html: string, bindings?: any): Type<ShallowRenderContainer> {
  @Component({
    selector: 'shallow-container',
    template: html,
  })
  class ProxyShallowContainer extends ShallowRenderContainer {}
  Object.assign(ShallowRenderContainer.prototype, spyOnMethods(bindings));

  return ProxyShallowContainer;
}

