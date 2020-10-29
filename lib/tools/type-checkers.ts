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
} from '@angular/core';
import { pipeResolver, jitReflector } from './reflect';

export function isModuleWithProviders(thing: any): thing is ModuleWithProviders<any> {
  const key: keyof ModuleWithProviders<any> = 'ngModule';
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

const DECLARATION_TYPES = ['Pipe', 'Component', 'Directive'] as const;
export type DeclarationType = typeof DECLARATION_TYPES[number];
export const declarationTypes = (declaration: Type<any>): Array<DeclarationType> =>
  jitReflector
    .annotations(declaration)
    .filter(annotation => DECLARATION_TYPES.includes(annotation.ngMetadataName))
    .map(annotation => annotation.ngMetadataName);
