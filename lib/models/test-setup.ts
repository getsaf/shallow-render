import { Type, ModuleWithProviders, PipeTransform } from '@angular/core';
import { MockCache } from './mock-cache';

export interface TestSetup<TComponent> {
  testComponent: Type<TComponent>;
  testModule: Type<any> | ModuleWithProviders;
  dontMock: any[];
  mocks: Map<any, any>;
  mockPipes: Map<Type<PipeTransform>, any>;
  mockCache: MockCache;
}
