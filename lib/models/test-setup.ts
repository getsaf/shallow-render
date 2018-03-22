import { Type, Provider, ModuleWithProviders, PipeTransform } from '@angular/core';
import { MockCache } from './mock-cache';

export class TestSetup<TComponent> {
  readonly dontMock: any[] = [];
  readonly mocks = new Map<any, any>();
  readonly mockPipes = new Map<Type<PipeTransform>, any>();
  readonly mockCache = new MockCache();
  readonly providers: Provider[] = [];

  constructor(
    public readonly testComponent: Type<TComponent>,
    public readonly testModule: Type<any> | ModuleWithProviders,
  ) {
    this.dontMock.push(testComponent);
  }
}
