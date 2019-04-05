import { Provider } from '@angular/core';
import { testFramework } from '../test-framework';

export class MockOfProvider {
  constructor(public mockOf: Provider, stubs: any = {}) {
    Object.assign(this, stubs);
    Object.keys(stubs).forEach(key => {
      if (typeof (this as any)[key] === 'function' && !testFramework.isSpy((this as any)[key])) {
        testFramework.spyOn(this as any, key);
      }
    });
  }
}
