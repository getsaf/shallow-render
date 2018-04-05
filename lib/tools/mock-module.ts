import { ModuleWithProviders, NgModule, Provider, Type } from '@angular/core';
import { MockOf } from 'ng-mocks';
import { isModuleWithProviders } from './type-checkers';
import { ngMock } from './ng-mock';
import { mockProvider } from './mock-provider';
import { TestSetup } from '../models/test-setup';
import { ngModuleResolver } from './reflect';

export interface NgModuleAnnotations extends NgModule {
  imports: (any[] | Type<any> | ModuleWithProviders)[];
  declarations: (any[] | Type<any>)[];
  providers: Provider[];
  exports: (Type<any> | any[])[];
  entryComponents: (any[] | Type<any>)[];
}

const getAnnotations = (ngModule: Type<any>): NgModuleAnnotations => {
  const {
    imports = [],
    providers = [],
    declarations = [],
    exports = [],
    entryComponents = [],
  } = ngModuleResolver.resolve(ngModule) || {};

  return {imports, providers, declarations, exports, entryComponents};
};

export type AnyNgModule = any[] | Type<any> | ModuleWithProviders;
export function mockModule<TModule extends AnyNgModule>(mod: TModule, setup: TestSetup<any>): TModule {
  const cached = setup.mockCache.find(mod);
  if (cached) {
    return cached;
  }
  if (Array.isArray(mod)) {
    return setup.mockCache.add(mod, mod.map(i => mockModule(i, setup))) as TModule; // Recursion
  } else if (isModuleWithProviders(mod)) {
    // If we have a moduleWithProviders, make sure we return the same
    return {
      ngModule: mockModule(mod.ngModule, setup), // Recursion
      providers: mod.providers && mod.providers.map(p => mockProvider(p, setup))
    } as TModule;
  } else if (typeof mod !== 'function') {
    throw new Error(`Don't know how to mock module: ${mod}`);
  }

  const modClass = mod as Type<any>;
  const {imports, declarations, exports, entryComponents, providers} = getAnnotations(modClass);
  const mockedModule: NgModule = {
    imports: ngMock(imports, setup),
    declarations: ngMock(declarations, setup),
    exports: ngMock(exports, setup),
    entryComponents: ngMock(entryComponents, setup),
    providers: providers.map(p => mockProvider(p, setup)),
  };
  @NgModule(mockedModule)
  @MockOf(modClass)
  class MockModule {}

  return setup.mockCache.add(mod, MockModule) as TModule;
}

export function copyTestModule<TComponent>(setup: TestSetup<TComponent>): NgModuleAnnotations {
  let mod: Type<any>;
  let providers: Provider[] = [];
  if (isModuleWithProviders(setup.testModule)) {
    providers = setup.testModule.providers || providers;
    mod = setup.testModule.ngModule;
  } else {
    mod = setup.testModule;
  }
  const ngModule = getAnnotations(mod);

  return {
    imports: ngMock(ngModule.imports, setup),
    declarations: ngMock(ngModule.declarations, setup),
    providers: [
      ...ngModule.providers.map(p => mockProvider(p, setup)),
      ...providers.map(p => mockProvider(p, setup)),
      ...setup.providers.map(p => mockProvider(p, setup)),
    ],
    exports: [],
    entryComponents: [],
  };
}
