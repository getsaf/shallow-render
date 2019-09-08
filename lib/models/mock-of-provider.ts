import { Type } from '@angular/core';
import { testFramework } from '../test-framework';
import { getProviderName } from '../tools/get-provider-name';

export class MockOfProvider {
  constructor(public mockOf: Type<any>, stubs: any = {}) {
    Object.assign(this, stubs);
    Object.keys(stubs).forEach(key => {
      if (typeof (this as any)[key] === 'function' && !testFramework.isSpy((this as any)[key])) {
        testFramework.spyOn(this as any, key);
      }
    });
  }
}

export const mockProviderClass = <TProvider extends Type<any>>(provider: TProvider, stubs: any): TProvider => {
  class MockProvider extends MockOfProvider { /* tslint:disable-line no-unnecessary-class */
    constructor() {
      super(provider, stubs);
    }
  }
  Object.defineProperty(MockProvider, 'name', {value: `MockOf${getProviderName(provider)}`});
  return MockProvider as TProvider;
};
