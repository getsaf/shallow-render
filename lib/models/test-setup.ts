import { Type, Provider, ModuleWithProviders, PipeTransform } from '@angular/core';
import { MockCache } from './mock-cache';

export class TestSetup<TComponent> {
  readonly dontMock: any[] = [];
  readonly mocks = new Map();
  readonly staticMocks = new Map();
  readonly moduleReplacements = new Map<Type<any> | ModuleWithProviders, Type<any> | ModuleWithProviders>();
  readonly mockPipes = new Map<PipeTransform | Type<PipeTransform>, Function>(); /* tslint:disable-line ban-types */
  readonly mockCache = new MockCache();
  readonly providers: Provider[] = [];
  readonly imports: (Type<any> | ModuleWithProviders)[] = [];

  constructor(
    public readonly testComponent: Type<TComponent>,
    public readonly testModule: Type<any> | ModuleWithProviders,
  ) { }
}
