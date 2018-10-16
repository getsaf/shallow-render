import { Type } from '@angular/core';

// Angular 5x has ModuleWithProviders and Angular 6 uses a generic ModuleWithProviders<T>.
// Building shallow with NG6 causes the d.ts output files to have a generic which is
// incompatible with NG5's definition so I created this backward compatible type here.
// Use this anywhere you would otherwise use a ModuleWithProvider
export interface BackwardCompatibleModuleWithProviders {
  ngModule: Type<any>;
  providers?: any[];
}

export type AngularModule = Type<any> | BackwardCompatibleModuleWithProviders;
