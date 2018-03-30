import { ModuleWithProviders, PipeTransform, Provider, ClassProvider, ValueProvider } from '@angular/core';
import { pipeResolver } from './reflect';

export function isModuleWithProviders(thing: any): thing is ModuleWithProviders {
  const key: keyof ModuleWithProviders = 'ngModule';
  return key in thing;
}

export function isValueProvider(provider: Provider): provider is ValueProvider {
  const key: keyof ValueProvider = 'useValue';
  return key in provider;
}

export function isClassProvider(provider: Provider): provider is ClassProvider {
  const key: keyof ClassProvider = 'useClass';
  return key in provider;
}

export function isPipeTransform(thing: any): thing is PipeTransform {
  return pipeResolver.isPipe(thing);
}
