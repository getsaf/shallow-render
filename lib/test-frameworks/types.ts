export interface TestFramework {
  isSpy(mockFunction: AnyFunction): boolean;

  spyOn<T>(object: T, method: keyof T, mockImplementation?: AnyFunction): any;

  resetSpy<T>(spy: T): void;

  mockImplementation<T>(spy: T, mockImplementation: AnyFunction): void;

  addMatchers(matcherFactories: CustomMatcherFactories): void;
}

export type AnyFunction = (args?: any) => any;

export interface CustomMatcher {
  compare<T>(actual: T, expected: T, ...args: any[]): CustomMatcherResult;

  compare(actual: any, ...expected: any[]): CustomMatcherResult;
}

export interface CustomMatcherFactories {
  [index: string]: CustomMatcherFactory;
}

export type CustomMatcherFactory = (
  util: MatchersUtil,
  customEqualityTesters: CustomEqualityTester[],
) => CustomMatcher;

export interface MatchersUtil {
  equals(a: any, b: any, customTesters?: CustomEqualityTester[]): boolean;

  contains<T>(
    haystack: ArrayLike<T> | string,
    needle: any,
    customTesters?: CustomEqualityTester[],
  ): boolean;

  buildFailureMessage(
    matcherName: string,
    isNot: boolean,
    actual: any,
    ...expected: any[]
  ): string;
}

export type CustomEqualityTester = (first: any, second: any) => boolean | void;

export interface CustomMatcherResult {
  pass: boolean;
  message?: string;
}
