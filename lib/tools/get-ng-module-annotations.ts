import { EnvironmentProviders, NgModule, Provider, SchemaMetadata, Type } from '@angular/core';
import { AngularModule } from '../models/angular-module';
import { reflect } from './reflect';

export interface NgModuleAnnotations extends NgModule {
  imports: (any[] | AngularModule)[];
  declarations: (any[] | Type<any>)[];
  providers: (Provider | EnvironmentProviders)[];
  exports: (Type<any> | any[])[];
  schemas: SchemaMetadata[] | any[];
}

export function getNgModuleAnnotations(ngModule: Type<any>): NgModuleAnnotations {
  const {
    imports = [],
    providers = [],
    declarations = [],
    exports = [],
    schemas = [],
  } = reflect.resolveModule(ngModule) || {};

  return { imports, providers, declarations, exports, schemas };
}
