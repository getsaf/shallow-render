import { QueryMatch } from '../models/query-match';
import { CustomMatcherFactories, CustomMatcherFactory } from './types';

export interface BaseArrayLikeMatchers<T> {
  toHaveFoundOne(): void;

  toHaveFoundMoreThan(count: number): void;

  toHaveFoundLessThan(count: number): void;

  toHaveFound(count: number): void;
}

const jasmineMatchers: CustomMatcherFactories = {
  toHaveFound: () => ({
    compare: (actual: QueryMatch<any>, expected: number) => ({
      pass: actual.length === expected,
      message: `Expected to find exactly ${expected} but found ${actual.length}`
    })
  }),

  toHaveFoundOne: () => ({
    compare: (actual: QueryMatch<any>) => ({
      pass: actual.length === 1,
      message: `Expected to find exactly 1 but found ${actual.length}`
    })
  }),

  toHaveFoundMoreThan: () => ({
    compare: (actual: QueryMatch<any>, expected: number) => ({
      pass: actual.length > expected,
      message: `Expected to find more than ${expected} but found ${actual.length}`
    })
  }),

  toHaveFoundLessThan: () => ({
    compare: (actual: QueryMatch<any>, expected: number) => ({
      pass: actual.length < expected,
      message: `Expected to find less than ${expected} but found ${actual.length}`
    })
  }),
};

const jasmineToJestMatcher = (jasmineMatcher: CustomMatcherFactory) => (actual: any, expected: any) => {
  const {pass, message} = jasmineMatcher().compare(actual, expected);
  return { pass, message: () => message };
};

const jestMatchers: CustomMatcherFactories = Object.keys(jasmineMatchers).reduce(
  (acc, name) => ({...acc, [name]: jasmineToJestMatcher(jasmineMatchers[name])}),
  {}
);

declare const jest: any;
export const shallowMatchers: CustomMatcherFactories = typeof jest === 'undefined' ? jasmineMatchers : jestMatchers;
