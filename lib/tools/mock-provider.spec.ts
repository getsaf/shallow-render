import { ValueProvider } from '@angular/core';
import { TestSetup } from '../models/test-setup';
import { mockProvider, MockProvider } from './mock-provider';

class DummyComponent {}
class DummyModule {}
class FooService {
  foo: 'foo';
}

describe('mockPrivider', () => {
  let testSetup: TestSetup<DummyComponent>;

  beforeEach(() => {
    testSetup = new TestSetup(DummyComponent, DummyModule);
  });

  it('auto-mocks classes', () => {
    const provider = mockProvider(FooService, testSetup) as ValueProvider; /* tslint:disable-line no-unnecessary-type-assertion */

    expect(provider.useValue instanceof MockProvider).toBe(true);
  });

  it('auto-mocks ClassProviders', () => {
    const provider = mockProvider({provide: FooService, useClass: FooService}, testSetup) as ValueProvider; /* tslint:disable-line no-unnecessary-type-assertion */

    expect(provider.provide).toBe(FooService);
    expect(provider.useValue instanceof MockProvider).toBe(true);
  });

  it('auto-mocks ValueProviders', () => {
    const provider = mockProvider({provide: FooService, useValue: 'anything goes here'}, testSetup) as ValueProvider; /* tslint:disable-line no-unnecessary-type-assertion */

    expect(provider.provide).toBe(FooService);
    expect(provider.useValue instanceof MockProvider).toBe(true);
  });

  it('auto-mocks FactoryProviders', () => {
    const provider = mockProvider({provide: FooService, useFactory: () => 'anything goes here'}, testSetup) as ValueProvider; /* tslint:disable-line no-unnecessary-type-assertion */

    expect(provider.provide).toBe(FooService);
    expect(provider.useValue instanceof MockProvider).toBe(true);
  });

  it('auto-mocks ExistingProviders', () => {
    const provider = mockProvider({provide: FooService, useExisting: 'anything goes here'}, testSetup) as ValueProvider; /* tslint:disable-line no-unnecessary-type-assertion */

    expect(provider.provide).toBe(FooService);
    expect(provider.useValue instanceof MockProvider).toBe(true);
  });

  it('prefers mocks from setup.mocks', () => {
    testSetup.mocks.set(FooService, {foo: 'mocked foo'});
    const provider = mockProvider(FooService, testSetup) as ValueProvider; /* tslint:disable-line no-unnecessary-type-assertion */

    expect(provider.provide).toBe(FooService);
    expect(provider.useValue.foo).toBe('mocked foo');
  });

  it('mocks from setup.mocks even if the class is in the setup.dontMock array', () => {
    testSetup.dontMock.push(FooService);
    testSetup.mocks.set(FooService, {foo: 'mocked foo'});
    const provider = mockProvider(FooService, testSetup) as ValueProvider; /* tslint:disable-line no-unnecessary-type-assertion */

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
    expect(providers[1].useValue instanceof MockProvider).toBe(true);
  });
});
