import { Provider } from '@angular/core';

export function getProviderName(provider: Provider | string): string {
  if (typeof provider === 'string') {
    return provider;
  }
  if (typeof provider === 'function') {
    return provider.name;
  }
  if ('provide' in provider) {
    return getProviderName(provider.provide); // Recursion
  }
  // This works well with InjectionTokens
  return provider.toString();
}
