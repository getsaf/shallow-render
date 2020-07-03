import { Provider } from '@angular/core';
import { getProviderName } from './get-provider-name';

describe('getProviderName', () => {
  let provider: Provider;
  it('returns a string value when provider is string', () => {
    provider = { provide: 'FOO', useValue: 'foo value' };
    expect(getProviderName(provider)).toBe('FOO');
  });

  it('returns a class name when provider.provide is a class', () => {
    provider = { provide: class Foo {}, useValue: 'foo value' };
    expect(getProviderName(provider)).toBe('Foo');
  });

  it('returns a class name when provider is a class', () => {
    provider = class Foo {};
    expect(getProviderName(provider)).toBe('Foo');
  });

  it('returns provider.provide.toString() when provider.provide is an object', () => {
    provider = {
      provide: {
        toString() {
          return 'Foo';
        },
      },
      useValue: 'foo value',
    };
    expect(getProviderName(provider)).toBe('Foo');
  });
});
