import { Provider } from '@angular/core';
import { Shallow } from '../shallow';

export class MockOfProvider {
  constructor(public mockOf: Provider, stubs: any = {}) {
    Object.assign(this, stubs);
    Object.keys(stubs).forEach(key => {
      if (typeof (this as any)[key] === 'function' && !Shallow.testFramework.isSpy((this as any)[key])) {
        Shallow.testFramework.spyOn(this as any, key);
      }
    });
  }
}
