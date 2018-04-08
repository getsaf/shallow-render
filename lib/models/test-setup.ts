import { Type, Provider, ModuleWithProviders, PipeTransform } from '@angular/core';
import { MockCache } from './mock-cache';

export class TestSetup<TComponent> {
  readonly dontMock: any[] = [];
  readonly mocks = new Map<any, any>();
  readonly mockPipes = new Map<PipeTransform | Type<PipeTransform>, Function>(); /* tslint:disable-line ban-types */
  readonly mockCache = new MockCache();
  readonly providers: Provider[] = [];

  constructor(
    public readonly testComponent: Type<TComponent>,
    public readonly testModule: Type<any> | ModuleWithProviders,
  ) { }
}
