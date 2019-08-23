import { NgModule, Provider, SchemaMetadata, Type } from '@angular/core';
import { AngularModule } from '../models/angular-module';
import { capturedProviders } from './intercept-root-providers';
import { ngModuleResolver } from './reflect';

export interface NgModuleAnnotations extends NgModule {
  imports: (any[] | AngularModule)[];
  declarations: (any[] | Type<any>)[];
  providers: Provider[];
  exports: (Type<any> | any[])[];
  entryComponents: (any[] | Type<any>)[];
  schemas: SchemaMetadata[] | any[];
}

export function getNgModuleAnnotations(ngModule: Type<any>): NgModuleAnnotations {
  const {
    imports = [],
    providers = [],
    declarations = [],
    exports = [],
    entryComponents = [],
    schemas = [],
  } = ngModuleResolver.resolve(ngModule) || {};

  return {
    imports,
    providers: [...providers, ...(capturedProviders.get(ngModule) || [])],
    declarations,
    exports,
    entryComponents,
    schemas};
}
