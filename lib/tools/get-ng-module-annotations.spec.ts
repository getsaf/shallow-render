import { NgModule } from '@angular/core';
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
      });
  });

  it('returns annotations from the module', () => {
    const annotations = {
        imports: [class {}],
        providers: [class {}],
        declarations: [class {}],
        exports: [class {}],
        entryComponents: [class {}],
    };
    @NgModule(annotations)
    class DummyModule {}

    expect(getNgModuleAnnotations(DummyModule))
      .toEqual(annotations);
  });
});
