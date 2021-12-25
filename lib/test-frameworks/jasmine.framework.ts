import { AnyFunction, TestFramework } from './types';

declare const jasmine: any;
declare const spyOn: any;

export const jasmineFramework: TestFramework = {
  createSpy: () => jasmine.createSpy(),

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
