import { QueryMatch } from '../models/query-match';
export interface ShallowMatchers {
  toHaveFoundOne(): void;
  toHaveFoundMoreThan(count: number): void;
  toHaveFoundLessThan(count: number): void;
  toHaveFound(count: number): void;
}
declare global {
  namespace jasmine {
    // tslint:disable-next-line
    interface ArrayLikeMatchers<T> extends ShallowMatchers { }
  }
  namespace jest {
    // tslint:disable-next-line
    interface ArrayLikeMatchers<T> extends ShallowMatchers { }
    // tslint:disable-next-line
    interface Matchers<T> extends ShallowMatchers { }
  }
}

type JasmineMatcher<TActual, TExpected> = () => {compare(actual: TActual, expected: TExpected): {pass: boolean; message: string}};
type JestMatcher<TActual, TExpected> = (actual: TActual, expected: TExpected) => {pass: boolean; message(): string};
const jasmineToJestMatcher = <TActual, TExpected>(jasmineMatcher: JasmineMatcher<TActual, TExpected>): JestMatcher<TActual, TExpected> => (actual: TActual, expected: TExpected) => {
  const {pass, message} = jasmineMatcher().compare(actual, expected);
  return { pass, message: () => message };
};

const jasmineMatchers = {
  toHaveFound: () => ({
    compare: (actual: QueryMatch<object>, expected: number) => ({
      pass: actual.length === expected,
      message: `Expected to find exactly ${expected} but found ${actual.length}`
    })
  }),

  toHaveFoundOne: () => ({
    compare: (actual: QueryMatch<object>) => ({
      pass: actual.length === 1,
      message: `Expected to find exactly 1 but found ${actual.length}`
    })
  }),

  toHaveFoundMoreThan: () => ({
    compare: (actual: QueryMatch<object>, expected: number) => ({
      pass: actual.length > expected,
      message: `Expected to find more than ${expected} but found ${actual.length}`
    })
  }),

  toHaveFoundLessThan: () => ({
    compare: (actual: QueryMatch<object>, expected: number) => ({
      pass: actual.length < expected,
      message: `Expected to find less than ${expected} but found ${actual.length}`
    })
  }),
};

const jestMatchers = {
  toHaveFound: jasmineToJestMatcher(jasmineMatchers.toHaveFound),
  toHaveFoundLessThan: jasmineToJestMatcher(jasmineMatchers.toHaveFoundLessThan),
  toHaveFoundMoreThan: jasmineToJestMatcher(jasmineMatchers.toHaveFoundMoreThan),
  toHaveFoundOne: jasmineToJestMatcher(jasmineMatchers.toHaveFoundOne),
};

/////////////////////
// For Type-Safe enforcement only
const _jasmineTypeCheck: {[K in keyof ShallowMatchers]: JasmineMatcher<any, any>} = jasmineMatchers;
const _jestTypeCheck: {[K in keyof ShallowMatchers]: JestMatcher<any, any>} = jestMatchers;
_jasmineTypeCheck.toString();
_jestTypeCheck.toString();
/////////////////////

declare const jest: any;
declare const expect: any;
if (typeof jest === 'undefined') {
  beforeEach(() => jasmine.addMatchers(jasmineMatchers));
} else {
  beforeEach(() => expect.extend(jestMatchers));
}
