import { ModuleWithProviders, NgModule, Provider, Type } from '@angular/core';
import { MockCache } from '../models/mock-cache';
import { isModuleWithProviders } from './type-checkers';
import { ngMock } from './ng-mock';

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

export function mockModule(
  mod: any[] | Type<any> | ModuleWithProviders,
  mockCache: MockCache,
  dontMock: any[],
): any[] | Type<any> {
  const cached = mockCache.find(mod);
  if (cached) {
    return cached as any[] | Type<any>;
  }
  let ngModule: Annotations;
  let moduleClass: Type<any>;
  let providers: Provider[] = [];
  if (Array.isArray(mod)) {
    return mockCache.add(mod, mod.map(i => mockModule(i, mockCache, dontMock))); // Recursion
  } else if (isModuleWithProviders(mod)) {
    moduleClass = mod.ngModule;
    if (mod.providers) {
      providers = mod.providers;
    }
  } else {
    moduleClass = mod as Type<any>;
  }
  ngModule = getAnnotations(moduleClass);
  const mockedModule: NgModule = {
    imports: ngMock(ngModule.imports, mockCache, dontMock),
    declarations: ngMock(ngModule.declarations, mockCache, dontMock),
    exports: ngMock(ngModule.exports, mockCache, dontMock),
    entryComponents: ngMock(ngModule.entryComponents, mockCache, dontMock),
    providers: ngModule.providers.concat(providers).map(i => mockProvider(i)),
  };
  @NgModule(mockedModule)
  class MockModule {}

  return mockCache.add(mod, MockModule);
}

// TODO Consolidate this into mockModule
export function copyTestModule(fromModuleClass: Type<any>, mockCache: MockCache, dontMock: any[]) {
  const ngModule = getAnnotations(fromModuleClass);
  return {
    imports: ngMock(ngModule.imports, mockCache, dontMock),
    declarations: ngMock(ngModule.declarations, mockCache, dontMock),
    providers: ngModule.providers.map(p => mockProvider(p)),
  };
}

