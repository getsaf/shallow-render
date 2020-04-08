import { ExistingProvider, ValueProvider, InjectionToken } from '@angular/core';
import { MockOfProvider } from '../models/mock-of-provider';
import { TestSetup } from '../models/test-setup';
import { mockProvider } from './mock-provider';

class FooService {
  foo = 'foo';
}

describe('mockPrivider', () => {
  let testSetup: TestSetup<any>;

  beforeEach(() => {
    testSetup = new TestSetup(class {}, class {});
  });

  it('sets the class name to be MockOf + the provider name', () => {
    const provider = mockProvider(FooService, testSetup) as ValueProvider;

    expect(provider.useValue.constructor.name).toBe('MockOfFooService');
  });

  it('auto-mocks TypeProviders', () => {
    const provider = mockProvider(FooService, testSetup) as ValueProvider;

    expect(provider.useValue instanceof MockOfProvider).toBe(true);
  });

  it('auto-mocks ClassProviders', () => {
    const provider = mockProvider({ provide: FooService, useClass: FooService }, testSetup);

    expect(provider.provide).toBe(FooService);
    const instance = new provider.useClass();
    expect(instance instanceof MockOfProvider).toBe(true);
  });

  it('auto-mocks ValueProviders', () => {
    const provider = mockProvider({ provide: FooService, useValue: {} }, testSetup);

    expect(provider.provide).toBe(FooService);
    expect(provider.useValue instanceof MockOfProvider).toBe(true);
  });

  it('auto-mocks FactoryProviders', () => {
    const provider = mockProvider({ provide: FooService, useFactory: () => ({}) }, testSetup);

    expect(provider.provide).toBe(FooService);
    const instance = provider.useFactory();
    expect(instance instanceof MockOfProvider).toBe(true);
  });

  it('passes through ExistingProviders', () => {
    const existingProvider: ExistingProvider = { provide: FooService, useExisting: 'anything goes here' };
    const provider = mockProvider(existingProvider, testSetup);

    expect(provider).toBe(existingProvider);
  });

  it('prefers mocks from setup.mocks', () => {
    testSetup.mocks.set(FooService, { foo: 'mocked foo' });
    const provider = mockProvider(FooService, testSetup) as ValueProvider;

    expect(provider.provide).toBe(FooService);
    expect(provider.useValue.foo).toBe('mocked foo');
  });

  it('mocks from setup.mocks even if the class is in the setup.dontMock array', () => {
    testSetup.dontMock.push(FooService);
    testSetup.mocks.set(FooService, { foo: 'mocked foo' });
    const provider = mockProvider(FooService, testSetup) as ValueProvider;

    expect(provider.provide).toBe(FooService);
    expect(provider.useValue.foo).toBe('mocked foo');
  });

  it('does not mock if the class is in the setup.dontMock array', () => {
    testSetup.dontMock.push(FooService);
    const provider = mockProvider(FooService, testSetup);

    expect(provider).toBe(FooService);
  });

  it('mocks arrays of things', () => {
    class BarService {}
    testSetup.dontMock.push(FooService);
    const providers = mockProvider([FooService, BarService], testSetup) as any[];

    // FooService was not mocked
    expect(providers[0]).toBe(FooService);
    // BarService was mocked
    expect(providers[1].provide).toBe(BarService);
    expect(providers[1].useValue instanceof MockOfProvider).toBe(true);
  });

  it('does not mock services when they are part of a provider array in dontMock', () => {
    // Angular allows a provider to be defined as an array of providers
    // so in this instance, adding an array that contains FooService *should*
    // be the same as adding just FooService.
    testSetup.dontMock.push([FooService]);
    const providers = mockProvider([FooService], testSetup) as any[];

    expect(providers[0]).toBe(FooService);
  });

  it('does not mock services when they are part of a Type/Value/Factory provider in dontMock', () => {
    testSetup.dontMock.push({ provide: FooService, useValue: 'TEST VALUE' });
    const providers = mockProvider([FooService], testSetup) as any[];

    expect(providers[0]).toBe(FooService);
  });

  it('mocks non-object injection tokens', () => {
    const STRING_TOKEN = new InjectionToken<string>('My string token');
    const FUNCTION_TOKEN = new InjectionToken<() => string>('My function token');
    testSetup.mocks.set(STRING_TOKEN, 'FOO');
    testSetup.mocks.set(FUNCTION_TOKEN, () => 'BAR');
    const providers = mockProvider(
      [
        { provide: STRING_TOKEN, useValue: 'ORIGINAL-STRING' },
        { provide: FUNCTION_TOKEN, useValue: () => 'ORIGINAL-FUNCTION' }
      ],
      testSetup
    ) as any[];

    expect(providers[0].useValue).toBe('FOO');
    expect(providers[1].useValue()).toBe('BAR');
  });

  it('mocks falsy injection tokens', () => {
    const STRING_TOKEN = new InjectionToken<string>('My string token');
    const BOOLEAN_TOKEN = new InjectionToken<boolean>('My boolean token');
    const NUMBER_TOKEN = new InjectionToken<number>('My number token');
    testSetup.mocks.set(STRING_TOKEN, '');
    testSetup.mocks.set(BOOLEAN_TOKEN, false);
    testSetup.mocks.set(NUMBER_TOKEN, 0);
    const providers = mockProvider(
      [
        { provide: STRING_TOKEN, useValue: 'FOO' },
        { provide: BOOLEAN_TOKEN, useValue: true },
        { provide: NUMBER_TOKEN, useValue: 42 }
      ],
      testSetup
    ) as any[];

    expect(providers[0].useValue).toBe('');
    expect(providers[1].useValue).toBe(false);
    expect(providers[2].useValue).toBe(0);
  });

  it('automocks injection tokens', () => {
    const STRING_TOKEN = new InjectionToken<string>('My string token');
    const BOOLEAN_TOKEN = new InjectionToken<boolean>('My boolean token');
    const NUMBER_TOKEN = new InjectionToken<number>('My number token');
    const providers = mockProvider(
      [
        { provide: STRING_TOKEN, useValue: 'FOO' },
        { provide: BOOLEAN_TOKEN, useValue: true },
        { provide: NUMBER_TOKEN, useValue: 42 }
      ],
      testSetup
    ) as any[];

    expect(providers[0].useValue instanceof MockOfProvider).toBe(true);
    expect(providers[1].useValue instanceof MockOfProvider).toBe(true);
    expect(providers[2].useValue instanceof MockOfProvider).toBe(true);
  });
});
