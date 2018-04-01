import { ModuleWithProviders, NgModule, Provider, Type } from '@angular/core';
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

export function mockModule(mod: any[] | Type<any> | ModuleWithProviders, setup: TestSetup<any>): any[] | Type<any> {
  const cached = setup.mockCache.find(mod);
  if (cached) {
    return cached as any[] | Type<any>; /* tslint:disable-line no-unnecessary-type-assertion */
  }
  let moduleClass: Type<any>;
  let extraProviders: Provider[] = [];
  if (Array.isArray(mod)) {
    return setup.mockCache.add(mod, mod.map(i => mockModule(i, setup))); // Recursion
  } else if (isModuleWithProviders(mod)) {
    moduleClass = mod.ngModule;
    if (mod.providers) {
      extraProviders = mod.providers;
    }
  } else if (typeof mod === 'function') {
    moduleClass = mod;
  } else {
    throw new Error(`Don't know how to mock module: ${mod}`);
  }

  const {imports, declarations, exports, entryComponents, providers} = getAnnotations(moduleClass);
  const mockedModule: NgModule = {
    imports: ngMock(imports, setup),
    declarations: ngMock(declarations, setup),
    exports: ngMock(exports, setup),
    entryComponents: ngMock(entryComponents, setup),
    providers: providers
      .concat(extraProviders)
      .map(p => mockProvider(p, setup)),
  };
  @NgModule(mockedModule)
  class MockModule {}

  return setup.mockCache.add(mod, MockModule);
}

// TODO Consolidate this into mockModule?
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
