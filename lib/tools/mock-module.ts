import { ModuleWithProviders, NgModule, Provider, Type } from '@angular/core';
import { isModuleWithProviders } from './type-checkers';
import { ngMock } from './ng-mock';
import { mockProvider } from './mock-provider';
import { TestSetup } from '../models/test-setup';

interface Annotations {
  imports: (any[] | Type<any> | ModuleWithProviders)[];
  declarations: (any[] | Type<any>)[];
  providers: Provider[];
  exports: (Type<any> | any[])[];
  entryComponents: (any[] | Type<any>)[];
}

const getAnnotations = (ngModule: Type<any>): Annotations => {
  let annotations: NgModule;
  const ngModuleAsAny = ngModule as any;
  if (Array.isArray(ngModuleAsAny.__annotations__)) {
    annotations = ngModuleAsAny.__annotations__[0];
  } else if (Array.isArray(ngModuleAsAny.decorators)) {
    annotations = ngModuleAsAny.decorators[0].args[0];
  } else {
    throw new Error(`Cannot find the annotations or decorator properties for class ${ngModule.name || ngModule}`);
  }

  const {
    imports = [] as (any[] | Type<any> | ModuleWithProviders)[],
    providers = [] as Provider[],
    declarations = [] as (any[] | Type<any>)[],
    exports = [] as (Type<any> | any[])[],
    entryComponents = [] as (any[] | Type<any>)[],
  } = annotations;

  return {imports, providers, declarations, exports, entryComponents};
};

export function mockModule(mod: any[] | Type<any> | ModuleWithProviders, setup: TestSetup<any>): any[] | Type<any> {
  const cached = setup.mockCache.find(mod);
  if (cached) {
    return cached as any[] | Type<any>; /* tslint:disable-line no-unnecessary-type-assertion */
  }
  let ngModule: Annotations;
  let moduleClass: Type<any>;
  let providers: Provider[] = [];
  if (Array.isArray(mod)) {
    return setup.mockCache.add(mod, mod.map(i => mockModule(i, setup))); // Recursion
  } else if (isModuleWithProviders(mod)) {
    moduleClass = mod.ngModule;
    if (mod.providers) {
      providers = mod.providers;
    }
  } else {
    moduleClass = mod;
  }
  ngModule = getAnnotations(moduleClass);
  const mockedModule: NgModule = {
    imports: ngMock(ngModule.imports, setup),
    declarations: ngMock(ngModule.declarations, setup),
    exports: ngMock(ngModule.exports, setup),
    entryComponents: ngMock(ngModule.entryComponents, setup),
    providers: ngModule.providers
      .concat(providers)
      .map(p => mockProvider(p, setup)),
  };
  @NgModule(mockedModule)
  class MockModule {}

  return setup.mockCache.add(mod, MockModule);
}

// TODO Consolidate this into mockModule?
export function copyTestModule<TComponent>(setup: TestSetup<TComponent>) {
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
    ],
  };
}
