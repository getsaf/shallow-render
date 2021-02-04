import { CommonModule } from '@angular/common';
import { NgModule, Provider, Type } from '@angular/core';
import { AngularModule } from '../models/angular-module';
import { TestSetup } from '../models/test-setup';
import { getNgModuleAnnotations } from './get-ng-module-annotations';
import { mockProvider } from './mock-provider';
import { ngMock } from './ng-mock';
import { isModuleWithProviders } from './type-checkers';

export function createTestModule<TComponent>(
  setup: TestSetup<TComponent>,
  testComponents: Type<any>[] = []
): AngularModule {
  let mod: Type<any>;
  let additionalProviders: Provider[] = [];
  if (isModuleWithProviders(setup.testModule)) {
    additionalProviders = setup.testModule.providers || additionalProviders;
    mod = setup.testModule.ngModule;
  } else {
    mod = setup.testModule;
  }
  const ngModule = getNgModuleAnnotations(mod);

  const declarations = ngMock(
    [...ngModule.declarations, ...setup.declarations].filter(d => d !== setup.testComponentOrService),
    setup
  );
  // Test Modules cannot directly define entryComponents. To work around this,
  // we create a new module which declares/exports all entryComponents and import
  // the module into the TestModule.
  const entryComponents = [...ngMock([...ngModule.entryComponents], setup), ...setup.declarations];

  @NgModule({
    imports: [...ngMock([...ngModule.imports, ...setup.imports], setup), CommonModule],
    declarations: [...declarations, ...testComponents],
    entryComponents,
    providers: mockProvider([...[...setup.providers].reverse(), ...ngModule.providers, ...additionalProviders], setup),
    exports: [...declarations, ...entryComponents],
    schemas: ngModule.schemas || [],
  })
  class ShallowTestModule {}

  return ShallowTestModule;
}
