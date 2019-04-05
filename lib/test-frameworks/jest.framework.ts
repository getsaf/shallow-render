import { AnyFunction, CustomMatcherFactories, TestFramework } from './index';
import { BaseArrayLikeMatchers } from './matchers';

declare var jest: any;
declare var expect: any;

export class JestFramework implements TestFramework {
  isSpy = (mockFunction: any): boolean => jest.isMockFunction(mockFunction);

  spyOn<T>(object: T, method: keyof T, mockImplementation?: AnyFunction) {
    const spy = jest.spyOn(object, method);

    if (!!mockImplementation) {
      this.mockImplementation(spy, mockImplementation);
    }

    return spy;
  }

  mockImplementation(spy: any, mockImplementation: AnyFunction): void {
    spy.mockImplementation(mockImplementation);
  }

  resetSpy(spy: any): void {
    spy.mockReset();
  }

  addMatchers(matcherFactories: CustomMatcherFactories): void {
    expect.extend(matcherFactories);
  }
}

declare global {
  namespace jest {
    export interface ArrayLikeMatchers<T> extends BaseArrayLikeMatchers<T> {}
  }
}
