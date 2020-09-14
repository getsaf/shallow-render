import { APP_INITIALIZER, Provider, InjectionToken, TypeProvider, ValueProvider } from '@angular/core';
import { mockProviderClass } from '../models/mock-of-provider';
import { TestSetup } from '../models/test-setup';
import { isClassProvider, isExistingProvider, isFactoryProvider, isTypeProvider } from './type-checkers';

const recursiveFindProvider = (haystack: Provider[], needle: Provider): Provider | undefined =>
  haystack.find(
    i =>
      i === needle ||
      (typeof i === 'object' && 'provide' in i && i.provide === needle) ||
      (Array.isArray(i) && recursiveFindProvider(i, needle))
  );

export function mockProvider(providerToMock: TypeProvider, setup: TestSetup<any>): ValueProvider | TypeProvider;
export function mockProvider<TProvider extends Provider>(providerToMock: TProvider, setup: TestSetup<any>): TProvider;
export function mockProvider(providerToMock: Provider, setup: TestSetup<any>): Provider {
  const provider = recursiveFindProvider(setup.providers, providerToMock) || providerToMock;
  if (Array.isArray(provider)) {
    return provider.map(p => mockProvider(p, setup)); // Recursion
  } else if (isExistingProvider(provider)) {
    return provider;
  }

  // APP_INITIALIZERS break TestBed!
  // Do this until https://github.com/angular/angular/issues/24218 is fixed
  if (!isTypeProvider(provider) && provider.provide === APP_INITIALIZER) {
    return [];
  }

  const provide = isTypeProvider(provider) ? provider : provider.provide;
  const hasMocks = setup.mocks.has(provide);
  const userMocks = setup.mocks.get(provide);

  // TODO: What if setup.dontMock.includes(provide.useClass)?
  if (!hasMocks && recursiveFindProvider(setup.dontMock, provide)) {
    return provider;
  }

  // Value-based Injection Tokens pass straight through
  if (hasMocks && provide instanceof InjectionToken && 'useValue' in provider) {
    return { provide, useValue: userMocks };
  }

  const MockProvider = mockProviderClass(isClassProvider(provider) ? provider.useClass : provide, userMocks);

  const prov = {
    provide,
    multi: 'multi' in provider && provider.multi,
  };

  if (isClassProvider(provider)) {
    return { ...prov, useClass: MockProvider };
  }
  if (isFactoryProvider(provider)) {
    return { ...prov, useFactory: () => new MockProvider() };
  }
  return { ...prov, useValue: new MockProvider() };
}
