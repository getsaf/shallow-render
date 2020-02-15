import {
  ClassProvider,
  ExistingProvider,
  FactoryProvider,
  ModuleWithProviders,
  PipeTransform,
  Provider,
  TypeProvider,
  ValueProvider,
  Type
} from '@angular/core';
import { pipeResolver } from './reflect';

export function isModuleWithProviders(thing: any): thing is ModuleWithProviders {
  const key: keyof ModuleWithProviders = 'ngModule';
  return typeof thing === 'object' && key in thing;
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

export function isPipeTransform(thing: any): thing is PipeTransform & Type<any> {
  return pipeResolver.isPipe(thing);
}

export const isClass = (thing: any): thing is Type<any> => {
  return typeof thing === 'function';
};
