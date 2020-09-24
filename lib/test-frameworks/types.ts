export interface TestFramework {
  createSpy(): any;

  isSpy(mockFunction: AnyFunction): boolean;

  spyOn<T>(object: T, method: keyof T, mockImplementation?: AnyFunction): any;

  resetSpy(spy: any): void;

  mockImplementation(spy: any, mockImplementation: AnyFunction): void;
}

export type AnyFunction = (...args: any[]) => any;
