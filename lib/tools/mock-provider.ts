import { Provider } from '@angular/core';

export class MockProvider {
  constructor(public provider: any) {}
}

export function mockProvider(provider: Provider, mocks: Map<any, any>, dontMock: any[]): Provider {
  let provide: any;

  if (typeof provider === 'function') {
    provide = provider;
  } else if (Array.isArray(provider)) {
    return provider.map(mockProvider); // Recursion
  } else {
    provide = provider.provide;
  }

  const userProvidedMock = mocks.get(provide);
  if (userProvidedMock) {
    return {provide, useValue: Object.assign(new MockProvider(provide), userProvidedMock.stubs)};
  } else if (!dontMock.includes(provider)) {
    return {provide, useValue: new MockProvider(provide)};
  } else {
    return provider;
  }
}

