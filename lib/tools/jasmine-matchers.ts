import { QueryMatch } from '../models/query-match';
import CustomMatcherFactories = jasmine.CustomMatcherFactories;
require('./jasmine-matchers-namespace'); // tslint:disable-line

export const jasmineMatchers: CustomMatcherFactories = {
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
