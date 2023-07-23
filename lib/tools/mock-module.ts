import { NgModule, Type } from '@angular/core';
import { AngularModule } from '../models/angular-module';
import { TestSetup } from '../models/test-setup';
import { getNgModuleAnnotations } from './get-ng-module-annotations';
import { mockProvider } from './mock-provider';
import { ngMock } from './ng-mock';
import { isModuleWithProviders } from './type-checkers';
import { CustomError } from '../models/custom-error';
import { MockOf } from './mock-of.directive';

export class InvalidModuleError extends CustomError {
  constructor(mod: any) {
    super(`Don't know how to mock module: ${mod}`);
  }
}

const collapseModuleWithProviders = <TThing>(mod: TThing): TThing => {
  if (Array.isArray(mod)) {
    return mod.map(collapseModuleWithProviders) as any;
  } else if (isModuleWithProviders(mod)) {
    return collapseModuleWithProviders(mod.ngModule) as any;
  }
  return mod;
};

export type AnyNgModule = any[] | AngularModule;
export function mockModule<TModule extends AnyNgModule>(mod: TModule, setup: TestSetup<any>): TModule {
  const cached = setup.mockCache.find(mod);
  if (cached) {
    return cached;
  }

  const replacementModule =
    setup.moduleReplacements.get(mod as any) || setup.moduleReplacements.get((mod as any).ngModule);
  if (replacementModule) {
    return setup.mockCache.add(mod, replacementModule) as TModule;
  }

  if (Array.isArray(mod)) {
    return setup.mockCache.add(
      mod,
      mod.map(i => mockModule(i, setup))
    ) as TModule; // Recursion
  } else if (isModuleWithProviders(mod)) {
    // If we have a moduleWithProviders, make sure we return the same
    return {
      ngModule: mockModule(mod.ngModule, setup), // Recursion
      providers: mod.providers && mod.providers.map(p => mockProvider(p, setup)),
    } as TModule;
  } else if (typeof (mod as any) !== 'function') {
    throw new InvalidModuleError(mod);
  }

  const modClass = mod as Type<any>;

  const { imports, declarations, exports,  providers, schemas } = getNgModuleAnnotations(modClass);
  const mockedModule: NgModule = {
    imports: ngMock(imports, setup),
    declarations: ngMock(declarations, setup),
    exports: collapseModuleWithProviders(ngMock(exports, setup)),
    providers: providers.map(p => mockProvider(p, setup)),
    schemas,
  };
  @MockOf(modClass)
  @NgModule(mockedModule)
  class MockModule {}

  return setup.mockCache.add(mod, MockModule) as TModule;
}
