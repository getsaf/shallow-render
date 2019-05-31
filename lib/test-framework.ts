import { jasmineFramework } from './test-frameworks/jasmine.framework';
import { jestFramework } from './test-frameworks/jest.framework';
import './test-frameworks/namespaces';
import { shallowMatchers } from './test-frameworks/shallow-matchers';
import { TestFramework } from './test-frameworks/types';

declare var jest: any;

export const testFramework: TestFramework = typeof jest === 'undefined' ? jasmineFramework : jestFramework;

beforeAll(() => {
  testFramework.addMatchers(shallowMatchers);
});
