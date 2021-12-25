import { AnyFunction, TestFramework } from './types';

declare const jest: any;

export const jestFramework: TestFramework = {
  createSpy: () => jest.fn(),

  isSpy: (mockFunction: any): boolean => jest.isMockFunction(mockFunction),

  spyOn<T>(object: T, method: keyof T, mockImplementation?: AnyFunction) {
    const spy = jest.spyOn(object, method);

    if (!!mockImplementation) {
      this.mockImplementation(spy, mockImplementation);
    }

    return spy;
  },

  mockImplementation(spy: any, mockImplementation: AnyFunction): void {
    spy.mockImplementation(mockImplementation);
  },

  resetSpy(spy: any): void {
    spy.mockReset();
  },
};
