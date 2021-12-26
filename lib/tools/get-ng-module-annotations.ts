import { NgModule, Provider, SchemaMetadata, Type } from '@angular/core';
import { AngularModule } from '../models/angular-module';
import { reflect } from './reflect';

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
  } = reflect.resolveModule(ngModule) || {};

  return { imports, providers, declarations, exports, entryComponents, schemas };
}
