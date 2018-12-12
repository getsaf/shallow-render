import { Type, Component, NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { getNgModuleAnnotations } from './get-ng-module-annotations';
import { mockModule, InvalidModuleError } from './mock-module';
import { TestSetup } from '../models/test-setup';
import * as _ngMock from './ng-mock';
import * as _mockProvider from './mock-provider';

@Component({
  selector: 'foo-component',
  template: '<div>FOO</div>',
})
class FooComponent {}

@Component({
  selector: 'bar-component',
  template: '<div>BAR</div>',
})
class BarComponent {}

const makeModule = (params: NgModule = {}): Type<any> => {
  @NgModule(params)
  class TestModule {}
  return TestModule;
};

describe('mockModule', () => {
  let setup: TestSetup<any>;

  const isMocked = (thing: any) => thing.name.includes('Mock');
  const isMockOf = (mock: any, thing: any) => mock.original === thing;
  const makeMock = <TParams extends NgModule>(params: TParams) => {
    const ngModule = makeModule(params);
    const mockedModule = mockModule(ngModule, setup);
    return {
      ngModule,
      mockedModule,
      annotations: getNgModuleAnnotations(mockedModule) as TParams,
    };
  };

  beforeEach(() => {
    const dummyMocker = (thing: any) => class Mock { static original = thing; };
    spyOn(_ngMock, 'ngMock').and.callFake(dummyMocker);
    spyOn(_mockProvider, 'mockProvider').and.callFake(dummyMocker);
    setup = new TestSetup(class Foo {}, class Bar {});
  });

  it('mocks an imports entry that is an array of modules', () => {
    const moduleArray = [makeModule(), makeModule()];
    const result = mockModule(moduleArray, setup);

    expect(result.map(isMocked)).toEqual([true, true]);
  });

  it('does not mock replacementModules', () => {
    const original = makeModule();
    const replacement = makeModule();
    setup.moduleReplacements.set(original, replacement);
    const result = mockModule(original, setup);

    expect(result).toBe(replacement);
  });

  it('does not break apart replacementModules ModuleWithProviders', () => {
    const original = {ngModule: makeModule(), providers: [class FooClass {}]};
    const replacement = makeModule();
    setup.moduleReplacements.set(original, replacement);
    const result = mockModule(original, setup);

    expect(result).toBe(replacement as any);
  });

  it('looks for a match on ModuleWithProviders#ngModule', () => {
    const originalModule = makeModule();
    const moduleWithProviders = {ngModule: originalModule, providers: [class FooClass {}]};
    const replacement = makeModule();
    setup.moduleReplacements.set(originalModule, replacement);
    const result = mockModule(moduleWithProviders, setup);

    expect(result).toBe(replacement as any);
  });

  it('memoizes mocks of modules', () => {
    const mod = makeModule();
    expect(mockModule(mod, setup))
      .toBe(mockModule(mod, setup));
  });

  it('memoizes mocks of arrays', () => {
    const mod = [makeModule()];
    expect(mockModule(mod, setup))
      .toBe(mockModule(mod, setup));
  });

  it('memoizes mocks of arrays', () => {
    const mod = [makeModule()];
    expect(mockModule(mod, setup))
      .toBe(mockModule(mod, setup));
  });

  it('mocks imports', () => {
    const imports = [class FooModule {}, class BarModule {}];
    const {annotations} = makeMock({imports});

    expect(isMockOf(annotations.imports, imports)).toBe(true);
  });

  it('mocks declarations', () => {
    const declarations = [FooComponent, BarComponent];
    const {annotations} = makeMock({declarations});

    expect(isMockOf(annotations.declarations, declarations)).toBe(true);
  });

  it('mocks entryComponents', () => {
    const entryComponents = [FooComponent, BarComponent];
    const {annotations} = makeMock({entryComponents});

    expect(isMockOf(annotations.entryComponents, entryComponents)).toBe(true);
  });

  it('mocks providers', () => {
    class FooService {}
    class BarService {}
    const {annotations} = makeMock({
      providers: [FooService, BarService]
    });

    expect(isMockOf(annotations.providers[0], FooService)).toBe(true);
    expect(isMockOf(annotations.providers[1], BarService)).toBe(true);
  });

  it('applies schemas', () => {
    const {annotations} = makeMock({
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    });

    expect(annotations.schemas[0]).toBe(CUSTOM_ELEMENTS_SCHEMA);
  });

  it('throws an error when module is not a recognized Angular module', () => {
    const bogusModule = 'NOT A REAL MODULE';
    expect(() => mockModule(bogusModule as any, setup))
      .toThrow(new InvalidModuleError(bogusModule));
  });
});
