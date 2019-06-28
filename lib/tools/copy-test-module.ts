import { NgModule, Provider, Type } from '@angular/core';
import { TestSetup } from '../models/test-setup';
import { getNgModuleAnnotations, NgModuleAnnotations } from './get-ng-module-annotations';
import { mockProvider } from './mock-provider';
import { ngMock } from './ng-mock';
import { isModuleWithProviders } from './type-checkers';

export function copyTestModule<TComponent>(setup: TestSetup<TComponent>): NgModuleAnnotations {
  let mod: Type<any>;
  let providers: Provider[] = [];
  if (isModuleWithProviders(setup.testModule)) {
    providers = setup.testModule.providers || providers;
    mod = setup.testModule.ngModule;
  } else {
    mod = setup.testModule;
  }
  const ngModule = getNgModuleAnnotations(mod);

  // Test Modules cannot directly define entryComponents. To work around this,
  // we create a new module which declares/exports all entryComponents and import
  // the module into the TestModule.
  const entryComponents = [...ngModule.entryComponents, ...setup.declarations];
  @NgModule({
    declarations: entryComponents,
    entryComponents,
    exports: entryComponents
  })
  class EntryComponentTestModule {}

  return {
    imports: ngMock([ EntryComponentTestModule, ...ngModule.imports, ...setup.imports ], setup),
    declarations: ngMock(
      [...ngModule.declarations, ...setup.declarations].filter(d => !entryComponents.includes(d)),
      setup
    ),
    providers: [
      ...ngModule.providers,
      ...providers,
      ...setup.providers,
    ].map(p => mockProvider(p, setup)),
    entryComponents: [],
    exports: [],
    schemas: [...(ngModule.schemas || [])],
  };
}
