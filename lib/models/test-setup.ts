import { NgModule, PipeTransform, Provider, Type } from '@angular/core';
import { reflect } from '../tools/reflect';
import { AngularModule } from './angular-module';
import { MockCache } from './mock-cache';

/**
 * An empty module used to test Standalone components
 */
@NgModule({})
class EmptyModule {}

export class TestSetup<TTestTarget> {
  readonly dontMock: any[] = [this.testComponentOrService];
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

  constructor(
    public readonly testComponentOrService: Type<TTestTarget>,
    public readonly testModule: AngularModule = EmptyModule,
  ) {
    const isStandalone = reflect.isStandalone(testComponentOrService);
    const hasModule = testModule !== EmptyModule;

    if (isStandalone && hasModule) {
      throw new Error(
        `Do not specify a module when testing ${testComponentOrService.name} (because it is marked as "standalone")`,
      );
    }
    if (!isStandalone && !hasModule) {
      throw new Error(`A module must be specified when testing ${testComponentOrService.name}`);
    }
  }
}
