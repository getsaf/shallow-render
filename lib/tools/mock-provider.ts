import { APP_INITIALIZER, Provider, InjectionToken, TypeProvider, ValueProvider } from '@angular/core';
import { mockProviderClass } from '../models/mock-of-provider';
import { TestSetup } from '../models/test-setup';
import { isClassProvider, isExistingProvider, isFactoryProvider, isTypeProvider } from './type-checkers';

const recursiveIncludes = (array: any[], item: any): boolean =>
  !!array.find(i => i === item || (i && i.provide === item) || (Array.isArray(i) && recursiveIncludes(i, item)));

export function mockProvider(provider: TypeProvider, setup: TestSetup<any>): ValueProvider | TypeProvider;
export function mockProvider<TProvider extends Provider>(provider: TProvider, setup: TestSetup<any>): TProvider;
export function mockProvider(provider: Provider, setup: TestSetup<any>): Provider {
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
  const userMocks = setup.mocks.get(provide);

  if (provide instanceof InjectionToken) {
    return userMocks ? { provide, useValue: userMocks } : provider;
  }

  // TODO: What if setup.dontMock.includes(provide.useClass)?
  if (!userMocks && recursiveIncludes(setup.dontMock, provide)) {
    return provider;
  }

  const MockProvider = mockProviderClass(provide, userMocks);

  const prov = {
    provide,
    multi: 'multi' in provider && provider.multi
  };

  if (isClassProvider(provider)) {
    return { ...prov, useClass: MockProvider };
  }
  if (isFactoryProvider(provider)) {
    return { ...prov, useFactory: () => new MockProvider() };
  }
  return { ...prov, useValue: new MockProvider() };
}
