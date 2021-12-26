import { TestSetup } from '../models/test-setup';
import { reflect } from './reflect';
import { InjectionToken } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { mockProvider } from './mock-provider';

export const injectRootProviders = (setup: TestSetup<any>) => {
  setup.mocks.forEach((mock, thingToMock) => {
    if (!reflect.isDirective(thingToMock)) {
      if (thingToMock instanceof InjectionToken) {
        TestBed.overrideProvider(thingToMock, { useValue: mock });
      } else {
        const provider = mockProvider(thingToMock, setup);
        TestBed.overrideProvider(thingToMock, {
          useValue: provider.useValue,
          useFactory: provider.useFactory,
          deps: provider.deps,
        });
      }
    }
  });
};
