import { Provider } from '@angular/core';

export class MockOfProvider {
  constructor(public mockOf: Provider, stubs: any = {}) {
    Object.assign(this, stubs);
    Object.keys(stubs).forEach(key => {
      if (typeof (this as any)[key] === 'function') {
        spyOn(this as any, key).and.callThrough();
      }
    });
  }
}
