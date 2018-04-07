import { ModuleWithProviders, PipeTransform, Provider, ClassProvider, ExistingProvider, FactoryProvider, ValueProvider } from '@angular/core';
import { pipeResolver } from './reflect';

export function isModuleWithProviders(thing: any): thing is ModuleWithProviders {
  const key: keyof ModuleWithProviders = 'ngModule';
  return key in thing;
}

export function isValueProvider(provider: Provider): provider is ValueProvider {
  const key: keyof ValueProvider = 'useValue';
  return key in provider;
}

export function isExistingProvider(provider: Provider): provider is ExistingProvider {
  const key: keyof ExistingProvider = 'useExisting';
  return key in provider;
}

export function isFactoryProvider(provider: Provider): provider is FactoryProvider {
  const key: keyof FactoryProvider = 'useFactory';
  return key in provider;
}

export function isClassProvider(provider: Provider): provider is ClassProvider {
  const key: keyof ClassProvider = 'useClass';
  return key in provider;
}

export function isPipeTransform(thing: any): thing is PipeTransform {
  return pipeResolver.isPipe(thing);
}
