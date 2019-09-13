import { jasmineFramework } from './jasmine.framework';
import { jestFramework } from './jest.framework';
import { TestFramework } from './types';

declare var jest: any;
export const testFramework: TestFramework = typeof jest === 'undefined' ? jasmineFramework : jestFramework;
