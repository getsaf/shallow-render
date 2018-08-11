import { Type, Provider } from '@angular/core';
import { TestSetup } from '../models/test-setup';
import { getNgModuleAnnotations, NgModuleAnnotations } from './get-ng-module-annotations';
import { isModuleWithProviders } from './type-checkers';
import { ngMock } from './ng-mock';
import { mockProvider } from './mock-provider';

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

  return {
    imports: ngMock(ngModule.imports, setup),
    declarations: ngMock(ngModule.declarations, setup),
    entryComponents: ngMock(ngModule.entryComponents, setup),
    providers: [
      ...ngModule.providers,
      ...providers,
      ...setup.providers,
    ].map(p => mockProvider(p, setup)),
    exports: [],
    schemas: [...(ngModule.schemas || [])],
  };
}
