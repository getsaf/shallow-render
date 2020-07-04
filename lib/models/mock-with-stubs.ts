import { testFramework } from '../test-frameworks/test-framework';

export class MockWithStubs {
  constructor(stubs: object = {}) {
    Object.assign(this, stubs);
    Object.keys(stubs).forEach(key => {
      if (typeof (this as any)[key] === 'function' && !testFramework.isSpy((this as any)[key])) {
        testFramework.spyOn(this as any, key);
      }
    });
  }
}
