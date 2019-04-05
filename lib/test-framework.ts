import { TestFramework } from './test-frameworks';
import { JasmineFramework } from './test-frameworks/jasmine.framework';
import { JestFramework } from './test-frameworks/jest.framework';

declare var jest: any;

export const testFramework: TestFramework = typeof jest === 'undefined'
  ? new JasmineFramework()
  : new JestFramework();
