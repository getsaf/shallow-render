import {
  ClassProvider,
  ExistingProvider,
  FactoryProvider,
  ModuleWithProviders,
  PipeTransform,
  Provider,
  TypeProvider,
  ValueProvider,
  Type,
  ɵisEnvironmentProviders,
  EnvironmentProviders,
} from '@angular/core';
import { reflect } from './reflect';

export function isModuleWithProviders(thing: unknown): thing is ModuleWithProviders<any> {
  const key: keyof ModuleWithProviders<any> = 'ngModule';
  return !!thing && typeof thing === 'object' && key in thing;
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

export function isPipeTransform(thing: unknown): thing is PipeTransform & Type<any> {
  return reflect.isPipe(thing);
}

export const isClass = (thing: unknown): thing is Type<any> => {
  return typeof thing === 'function';
};

/**
 * Angular explicitly obscured the EnvironmentProviders type that require hard-casting to unbox
 */
export const isEnvironmentProviders = (thing: Provider | EnvironmentProviders): thing is EnvironmentProviders =>
  ɵisEnvironmentProviders(thing as Provider);
