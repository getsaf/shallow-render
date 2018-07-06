import { ModuleWithProviders, PipeTransform, Provider, ClassProvider, ExistingProvider, FactoryProvider, ValueProvider, TypeProvider } from '@angular/core';
import { pipeResolver } from './reflect';

export function isModuleWithProviders(provider: any): provider is ModuleWithProviders {
  const key: keyof ModuleWithProviders = 'ngModule';
  return typeof provider === 'object' && key in provider;
}

export function isValueProvider(provider: Provider): provider is ValueProvider {
  const key: keyof ValueProvider = 'useValue';
  return typeof provider === 'object' && key in provider;
}

export function isExistingProvider(provider: Provider): provider is ExistingProvider {
  const key: keyof ExistingProvider = 'useExisting';
  return typeof provider === 'object' && key in provider;
}

export function isFactoryProvider(provider: Provider): provider is FactoryProvider {
  const key: keyof FactoryProvider = 'useFactory';
  return typeof provider === 'object' && key in provider;
}

export function isClassProvider(provider: Provider): provider is ClassProvider {
  const key: keyof ClassProvider = 'useClass';
  return typeof provider === 'object' && key in provider;
}

export function isTypeProvider(provider: Provider): provider is TypeProvider {
  return typeof provider === 'function';
}

export function isPipeTransform(thing: any): thing is PipeTransform {
  return pipeResolver.isPipe(thing);
}
