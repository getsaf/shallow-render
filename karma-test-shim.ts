Error.stackTraceLimit = Infinity;

require('core-js/es6');
require('core-js/es7/reflect');

import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { getTestBed } from '@angular/core/testing';
import { interceptRootProviders } from './lib/tools/intercept-root-providers';
interceptRootProviders();

getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting()
);

