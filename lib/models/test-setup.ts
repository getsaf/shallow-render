import { PipeTransform, Provider, Type } from '@angular/core';
import { AngularModule } from './angular-module';
import { MockCache } from './mock-cache';

export class TestSetup<TComponent> {
  readonly dontMock: any[] = [];
  readonly mocks = new Map();
  readonly staticMocks = new Map();
  readonly moduleReplacements = new Map<AngularModule, AngularModule>();
  readonly mockPipes = new Map<PipeTransform | Type<PipeTransform>, Function>(); /* tslint:disable-line ban-types */
  readonly mockCache = new MockCache();
  readonly providers: Provider[] = [];
  readonly declarations: Type<any>[] = [];
  readonly imports: AngularModule[] = [];

  constructor(
    public readonly testComponent: Type<TComponent>,
    public readonly testModule: AngularModule
  ) { }
}
