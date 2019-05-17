import { Component, CUSTOM_ELEMENTS_SCHEMA, NgModule, Type } from '@angular/core';
import { TestSetup } from '../models/test-setup';
import { getNgModuleAnnotations } from './get-ng-module-annotations';
import { InvalidModuleError, mockModule } from './mock-module';
import * as _mockProvider from './mock-provider';
import * as _ngMock from './ng-mock';

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

const dummyMocker = (thing: any) => class Mock { static original = thing; };
const isMocked = (thing: any) => thing.name.includes('Mock');
const isMockOf = (mock: any, thing: any) => mock.original === thing;

describe('mockModule', () => {
  let setup: TestSetup<any>;

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
    const imports = [makeModule(), makeModule()];
    spyOn(_ngMock, 'ngMock').and.callFake(dummyMocker);
    const {annotations} = makeMock({imports});

    expect(isMockOf(annotations.imports, imports)).toBe(true);
  });

  it('mocks declarations', () => {
    const declarations = [FooComponent, BarComponent];
    spyOn(_ngMock, 'ngMock').and.callFake(dummyMocker);
    const {annotations} = makeMock({declarations});

    expect(isMockOf(annotations.declarations, declarations)).toBe(true);
  });

  it('mocks entryComponents', () => {
    const entryComponents = [FooComponent, BarComponent];
    spyOn(_ngMock, 'ngMock').and.callFake(dummyMocker);
    const {annotations} = makeMock({entryComponents});

    expect(isMockOf(annotations.entryComponents, entryComponents)).toBe(true);
  });

  it('mocks providers', () => {
    class FooService {}
    class BarService {}
    spyOn(_mockProvider, 'mockProvider').and.callFake(dummyMocker);
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

  it('does NOT pass through ngModuleWithProviders to the exports', () => {
    const originalModule = makeModule();
    const actualReplacementModule = makeModule();
    const replacementModuleWithProviders = {ngModule: actualReplacementModule, providers: []};
    setup.moduleReplacements.set(originalModule, replacementModuleWithProviders);
    const {annotations} = makeMock({
      exports: [originalModule]
    });

    expect(annotations.exports[0]).toBe(actualReplacementModule as any);
  });
});
