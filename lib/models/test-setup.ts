import { Type, Provider, PipeTransform } from '@angular/core';
import { MockCache } from './mock-cache';
import { AngularModule } from './angular-module';

export class TestSetup<TComponent> {
  readonly dontMock: any[] = [];
  readonly mocks = new Map<any, any>();
  readonly staticMocks = new Map<any, any>();
  readonly moduleReplacements = new Map<AngularModule, AngularModule>();
  readonly mockPipes = new Map<PipeTransform | Type<PipeTransform>, Function>(); /* tslint:disable-line ban-types */
  readonly mockCache = new MockCache();
  readonly providers: Provider[] = [];
  readonly imports: AngularModule[] = [];

  constructor(
    public readonly testComponent: Type<TComponent>,
    public readonly testModule: AngularModule
  ) { }
}
