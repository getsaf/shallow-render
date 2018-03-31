import { Provider } from '@angular/core';
import { TestSetup } from '../models/test-setup';

export class MockProvider {
  constructor(public mockOf: any, mockProperties: any = {}) {
    Object.assign(this, mockProperties);
  }
}

export function mockProvider(provider: Provider, setup: TestSetup<any>): Provider {
  let provide: any;

  if (Array.isArray(provider)) {
    return provider.map(p => mockProvider(p, setup)); // Recursion
  } else if (typeof provider === 'function') {
    provide = provider;
  } else {
    provide = provider.provide;
  }

  const userProvidedMock = setup.mocks.get(provide);
  if (userProvidedMock) {
    return {provide, useValue: new MockProvider(provide, userProvidedMock)};
  } else if (setup.dontMock.includes(provide)) {
    return provider;
  } else {
    return {provide, useValue: new MockProvider(provide)};
  }
}
