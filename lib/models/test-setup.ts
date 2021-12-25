import { PipeTransform, Provider, Type } from '@angular/core';
import { AngularModule } from './angular-module';
import { MockCache } from './mock-cache';

export class TestSetup<TTestTarget> {
  readonly dontMock: any[] = [];
  readonly mocks = new Map();
  readonly staticMocks = new Map();
  readonly moduleReplacements = new Map<AngularModule, AngularModule>();
  // eslint-disable-next-line @typescript-eslint/ban-types
  readonly mockPipes = new Map<PipeTransform | Type<PipeTransform>, Function>();
  readonly mockCache = new MockCache();
  readonly providers: Provider[] = [];
  readonly declarations: Type<any>[] = [];
  readonly imports: AngularModule[] = [];
  readonly withStructuralDirectives = new Map<Type<any>, boolean>();
  public alwaysRenderStructuralDirectives = false;

  constructor(public readonly testComponentOrService: Type<TTestTarget>, public readonly testModule: AngularModule) {}
}
