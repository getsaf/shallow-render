import { Provider, ValueProvider, TypeProvider } from '@angular/core';
import { MockOfProvider } from '../models/mock-of-provider';
import { TestSetup } from '../models/test-setup';
import { isClassProvider, isFactoryProvider, isExistingProvider, isTypeProvider } from './type-checkers';
import { getProviderName } from './get-provider-name';

export function mockProvider(provider: TypeProvider, setup: TestSetup<any>): ValueProvider | TypeProvider;
export function mockProvider<TProvider extends Provider>(provider: TProvider, setup: TestSetup<any>): TProvider;
export function mockProvider(provider: Provider, setup: TestSetup<any>): Provider {
  if (Array.isArray(provider)) {
    return provider.map(p => mockProvider(p, setup)); // Recursion
  } else if (isExistingProvider(provider)) {
    return provider;
  }

  const provide = isTypeProvider(provider) ? provider : provider.provide;
  const userMocks = setup.mocks.get(provide);

  // TODO: What if setup.dontMock.includes(provide.useClass)?
  if (!userMocks && setup.dontMock.includes(provide)) {
    return provider;
  }

  class MockProvider extends MockOfProvider { /* tslint:disable-line no-unnecessary-class */
    constructor() {
      super(provider, userMocks);
    }
  }
  Object.defineProperty(MockProvider, 'name', {value: `MockOf${getProviderName(provider)}`});

  const prov = {
    provide,
    multi: 'multi' in provider && provider.multi
  };

  if (isClassProvider(provider)) {
    return {...prov, useClass: MockProvider};
  }
  if (isFactoryProvider(provider)) {
    return {...prov, useFactory: () => new MockProvider()};
  }
  return {...prov, useValue: new MockProvider()};
}
