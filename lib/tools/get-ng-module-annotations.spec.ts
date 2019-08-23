import { Injectable, NgModule } from '@angular/core';
import { getNgModuleAnnotations } from './get-ng-module-annotations';

describe('getNgModuleAnnotations', () => {
  it('defaults all arrays to be empty', () => {
    @NgModule({})
    class DummyModule {}

    expect(getNgModuleAnnotations(DummyModule))
      .toEqual({
        imports: [],
        providers: [],
        declarations: [],
        exports: [],
        entryComponents: [],
        schemas: [],
      });
  });

  it('returns annotations from the module', () => {
    const annotations = {
      imports: [class {}],
      providers: [class {}],
      declarations: [class {}],
      exports: [class {}],
      entryComponents: [class {}],
      schemas: [class {}],
    };
    @NgModule(annotations)
    class DummyModule {}

    expect(getNgModuleAnnotations(DummyModule))
      .toEqual(annotations);
  });

  it('includes providers from capturedProviders', () => {
    @NgModule({})
    class FooModule {}

    @Injectable({providedIn: FooModule})
    class FooService {}

    expect(getNgModuleAnnotations(FooModule).providers).toContain(FooService);
  });
});
