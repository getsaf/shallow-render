import { APP_INITIALIZER, Provider, InjectionToken, TypeProvider, ValueProvider } from '@angular/core';
import { mockProviderClass } from '../models/mock-of-provider';
import { TestSetup } from '../models/test-setup';
import {
  isClassProvider,
  isExistingProvider,
  isFactoryProvider,
  isTypeProvider,
  isValueProvider,
  isPipeTransform,
} from './type-checkers';

const getProvide = (provider: Provider) => {
  if (Array.isArray(provider)) {
    return undefined;
  } else if (isTypeProvider(provider) || provider instanceof InjectionToken) {
    return provider;
  } else {
    return provider.provide;
  }
};

const recursiveFindProvider = (haystack: Provider[], needle: Provider): Provider | undefined => {
  for (const i of haystack) {
    if (Array.isArray(i)) {
      const found = recursiveFindProvider(i, needle); // Recursion
      if (found) return found;
    } else if (i === needle || (getProvide(i) && getProvide(i) === getProvide(needle))) {
      return i;
    }
  }
  return undefined;
};

export function mockProvider(providerToMock: TypeProvider, setup: TestSetup<any>): ValueProvider | TypeProvider;
export function mockProvider<TProvider extends Provider>(providerToMock: TProvider, setup: TestSetup<any>): TProvider;
export function mockProvider(providerToMock: Provider, setup: TestSetup<any>): Provider {
  const provider = recursiveFindProvider(setup.providers, providerToMock) || providerToMock;
  if (Array.isArray(provider)) {
    return provider.map(p => mockProvider(p, setup)); // Recursion
  } else if (isExistingProvider(provider)) {
    return provider;
  }
  const provide = isTypeProvider(provider) ? provider : provider.provide;
  const isPipe = isPipeTransform(provide);
  const hasMocks = setup.mocks.has(provide) || setup.mockPipes.has(provide);
  const userMocks = isPipe
    ? {
        transform: setup.mockPipes.get(provide) || (() => ''),
        ...setup.mocks.get(provide),
      }
    : setup.mocks.get(provide);

  // APP_INITIALIZERS break TestBed!
  // Do this until https://github.com/angular/angular/issues/24218 is fixed
  if (provide === APP_INITIALIZER) {
    return [];
  }

  // TODO: What if setup.dontMock.includes(provide.useClass)?
  if (!hasMocks && recursiveFindProvider(setup.dontMock, provider)) {
    return provider;
  }

  const prov = {
    provide,
    multi: 'multi' in provider && provider.multi,
  };

  // Value-based Injection Tokens pass straight through
  if (provide instanceof InjectionToken && isValueProvider(provider)) {
    return { ...prov, useValue: hasMocks ? userMocks : provider.useValue };
  }

  const MockProvider = mockProviderClass(isClassProvider(provider) ? provider.useClass : provide, userMocks);

  if (isClassProvider(provider)) {
    return { ...prov, useClass: MockProvider };
  }
  if (isFactoryProvider(provider)) {
    return { ...prov, useFactory: () => new MockProvider() };
  }
  return { ...prov, useValue: new MockProvider() };
}
