import { ModuleWithProviders, Provider, ValueProvider } from '@angular/core';

export function isModuleWithProviders(thing: any): thing is ModuleWithProviders {
  const key: keyof ModuleWithProviders = 'ngModule';
  return key in thing;
}

export function isValueProvider(provider: Provider): provider is ValueProvider {
  const key: keyof ValueProvider = 'useValue';
  return key in provider;
}
