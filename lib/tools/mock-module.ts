import { NgModule, Type } from '@angular/core';
import { MockOf } from 'ng-mocks';
import { isModuleWithProviders } from './type-checkers';
import { ngMock } from './ng-mock';
import { mockProvider } from './mock-provider';
import { TestSetup } from '../models/test-setup';
import { getNgModuleAnnotations } from './get-ng-module-annotations';
import { AngularModule } from '../models/angular-module';

export class InvalidModuleError {
  readonly message: string;
  constructor(public mod: any) {
    this.message = `Don't know how to mock module: ${mod}`;
  }
}

export type AnyNgModule = any[] | AngularModule;
export function mockModule<TModule extends AnyNgModule>(mod: TModule, setup: TestSetup<any>): TModule {
  const cached = setup.mockCache.find(mod);
  if (cached) {
    return cached;
  }

  const replacementModule = setup.moduleReplacements.get(mod as any);
  if (replacementModule) {
    return setup.mockCache.add(mod, replacementModule) as TModule;
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
    throw new InvalidModuleError(mod);
  }

  const modClass = mod as Type<any>;

  const {imports, declarations, exports, entryComponents, providers, schemas} = getNgModuleAnnotations(modClass);
  const mockedModule: NgModule = {
    imports: ngMock(imports, setup),
    declarations: ngMock(declarations, setup),
    exports: ngMock(exports, setup),
    entryComponents: ngMock(entryComponents, setup),
    providers: providers.map(p => mockProvider(p, setup)),
    schemas,
  };
  @NgModule(mockedModule)
  @MockOf(modClass)
  class MockModule {}

  return setup.mockCache.add(mod, MockModule) as TModule;
}
