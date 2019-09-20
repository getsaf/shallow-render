import { AnyFunction, TestFramework } from './types';

declare var jasmine: any;

export const jasmineFramework: TestFramework = {
  isSpy: (mockFunction: AnyFunction): boolean => jasmine.isSpy(mockFunction),

  spyOn<T>(object: T, method: keyof T, mockImplementation?: AnyFunction) {
    const spy = spyOn(object, method);

    if (!mockImplementation) {
      return spy.and.callThrough();
    }

    this.mockImplementation(spy, mockImplementation);

    return spy;
  },

  mockImplementation(spy: any, mockImplementation: (args?: any) => any): void {
    spy.and.callFake(mockImplementation);
  },

  resetSpy(spy: any): void {
    spy.calls.reset();
  },
};
