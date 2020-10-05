import { CustomError } from '../models/custom-error';
import { TestSetup } from '../models/test-setup';
import { testFramework } from '../test-frameworks/test-framework';

export class InvalidStaticPropertyMockError extends CustomError {
  static checkMockForStaticProperties(stubs: object) {
    Object.keys(stubs).forEach(key => {
      if (typeof (stubs as any)[key] !== 'function') {
        throw new InvalidStaticPropertyMockError(key);
      }
    });
  }

  constructor(key: string | symbol) {
    super(`Tried to mock the '${String(key)}' property but only functions are supported for static mocks.`);
  }
}

export const mockStatics = (setup: TestSetup<any>) => {
  setup.staticMocks.forEach((stubs, obj) => {
    InvalidStaticPropertyMockError.checkMockForStaticProperties(stubs);
    Object.keys(stubs).forEach(key => {
      const stub = stubs[key];
      if (!testFramework.isSpy(obj[key])) {
        testFramework.spyOn(obj, key, stub);
      } else {
        const spy = obj[key];
        testFramework.resetSpy(spy);
        testFramework.mockImplementation(spy, stub);
      }
    });
  });
};
