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

  it('does not mock various provider types found in the module or in the dontMock array', () => {
    class Foo {}
    class Bar {}
    class Baz {}
    const TEST_TOKEN_ONE = new InjectionToken<string>('Test Token');
    const TEST_TOKEN_TWO = new InjectionToken<string>('Test Token Two');

    testSetup.dontMock.push(Foo);
    testSetup.dontMock.push([[Bar]]); // Unlimited nexting arrays allowed by Angular
    testSetup.dontMock.push({ provide: Baz, useValue: 'THIS VALUE DOES NOT MATTER' });
    testSetup.dontMock.push({ provide: TEST_TOKEN_ONE, useValue: 'THIS VALUE DOES NOT MATTER' });
    testSetup.dontMock.push(TEST_TOKEN_TWO);
    const originalProvidersToMock = [
      { provide: Foo, useValue: 'ACTUAL FOO VALUE' },
      { provide: Bar, useValue: 'ACTUAL BAR VALUE' },
      [[Baz]],
      { provide: TEST_TOKEN_ONE, useValue: 'ORIGINAL TOKEN ONE VALUE', multi: true },
      { provide: TEST_TOKEN_TWO, useValue: 'ORIGINAL TOKEN TWO VALUE' },
    ];
    const providers = mockProvider(originalProvidersToMock, testSetup);

    expect(providers).toEqual(originalProvidersToMock);
  });

  it('mocks non-object injection tokens', () => {
    const STRING_TOKEN = new InjectionToken<string>('My string token');
    const FUNCTION_TOKEN = new InjectionToken<() => string>('My function token');
    testSetup.mocks.set(STRING_TOKEN, 'FOO');
    testSetup.mocks.set(FUNCTION_TOKEN, () => 'BAR');
    const providers = mockProvider(
      [
        { provide: STRING_TOKEN, useValue: 'ORIGINAL-STRING', multi: true },
        { provide: FUNCTION_TOKEN, useValue: () => 'ORIGINAL-FUNCTION', multi: true },
      ],
      testSetup
    ) as any[];

    expect(providers[0].useValue).toBe('FOO');
    expect(providers[0].multi).toBe(true);
    expect(providers[1].useValue()).toBe('BAR');
    expect(providers[1].multi).toBe(true);
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
        { provide: NUMBER_TOKEN, useValue: 42 },
      ],
      testSetup
    ) as any[];

    expect(providers[0].useValue).toBe('');
    expect(providers[1].useValue).toBe(false);
    expect(providers[2].useValue).toBe(0);
  });

  it('passes through mocks for injection tokens when they are value-providers', () => {
    const STRING_TOKEN = new InjectionToken<string>('My string token');
    const BOOLEAN_TOKEN = new InjectionToken<boolean>('My boolean token');
    const NUMBER_TOKEN = new InjectionToken<number>('My number token');
    const providers = mockProvider(
      [
        { provide: STRING_TOKEN, useValue: 'FOO' },
        { provide: BOOLEAN_TOKEN, useValue: true },
        { provide: NUMBER_TOKEN, useValue: 42 },
      ],
      testSetup
    ) as any[];

    expect(providers[0].useValue).toBe('FOO');
    expect(providers[1].useValue).toBe(true);
    expect(providers[2].useValue).toBe(42);
  });

  it('automocks injection tokens when they are class-providers', () => {
    class Foo {}
    const provider = mockProvider({ provide: new InjectionToken<Foo>('Foo Token'), useClass: Foo }, testSetup);

    expect(new provider.useClass() instanceof MockOfProvider).toBe(true);
    expect(provider.useClass.name).toBe('MockOfFoo');
  });

  it('subs injection tokens from test setup', () => {
    const BAR_TOKEN = new InjectionToken<string>('Bar Token');
    testSetup.providers.push({ provide: BAR_TOKEN, useValue: 'MOCK BAR' });
    const mockedProvider = mockProvider({ provide: BAR_TOKEN, useValue: 'BAR' }, testSetup);

    expect(mockedProvider.useValue).toEqual('MOCK BAR');
  });

  it('subs class providers from test setup', () => {
    class Foo {}
    testSetup.providers.push({ provide: Foo, useValue: 'MOCK FOO' });
    testSetup.dontMock.push(Foo);
    const mockedProvider: any = mockProvider(Foo, testSetup);

    expect(mockedProvider.useValue).toEqual('MOCK FOO');
  });

  it('subs factory providers from test setup', () => {
    class Foo {}
    testSetup.providers.push({ provide: Foo, useFactory: () => 'MOCK FOO' });
    testSetup.dontMock.push(Foo);
    const mockedProvider: any = mockProvider(Foo, testSetup);

    expect(mockedProvider.useFactory()).toEqual('MOCK FOO');
  });

  it('subs user provided services/tokens of varios provider types', () => {
    class Foo {}
    class Bar {}
    class Baz {}
    const TEST_TOKEN = new InjectionToken<string>('Test Token');

    // Use various ways to define providers...
    [
      Foo,
      [[Bar]],
      { provide: Baz, useValue: 'USER PROVIDED BAZ VALUE' },
      { provide: TEST_TOKEN, useValue: 'USER PROVIDED TOKEN VALUE' },
    ].forEach(provider => {
      testSetup.providers.push(provider);
      testSetup.dontMock.push(provider);
    });

    // Use different ways to define the module's providers
    const providers: any = mockProvider(
      [
        { provide: Foo, useValue: 'MODULE PROVIDED VALUE' },
        { provide: Bar, useValue: 'MODULE PROVIDED VALUE' },
        [[Baz]],
        { provide: TEST_TOKEN, useValue: 'MODULE PROVIDED VALUE' },
      ],
      testSetup
    );

    // The result is that the structure matches the module's structure, but user
    // provided services are substituted in-place
    expect(providers).toEqual([
      Foo,
      Bar,
      [[{ provide: Baz, useValue: 'USER PROVIDED BAZ VALUE' }]],
      { provide: TEST_TOKEN, useValue: 'USER PROVIDED TOKEN VALUE' },
    ]);
  });
});
