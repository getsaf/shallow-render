import { Provider } from '@angular/core';
import { TestSetup } from '../models/test-setup';

export class MockProvider {
  constructor(public provider: any) {}
}

export function mockProvider(provider: Provider, setup: TestSetup<any>): Provider {
  let provide: any;

  if (typeof provider === 'function') {
    provide = provider;
  } else if (Array.isArray(provider)) {
    return provider.map(p => mockProvider(p, setup)); // Recursion
  } else {
    provide = provider.provide;
  }

  const userProvidedMock = setup.mocks.get(provide);
  if (userProvidedMock) {
    return {provide, useValue: Object.assign(new MockProvider(provide), userProvidedMock)};
  } else if (!setup.dontMock.includes(provider)) {
    return {provide, useValue: new MockProvider(provide)};
  } else {
    return provider;
  }
}
