import { NgModule } from '@angular/core';
import { getNgModuleAnnotations } from './get-ng-module-annotations';

describe('getNgModuleAnnotations', () => {
  it('defaults all arrays to be empty', () => {
    @NgModule({})
    class DummyModule {}

    expect(getNgModuleAnnotations(DummyModule)).toEqual({
      imports: [],
      providers: [],
      declarations: [],
      exports: [],
      schemas: [],
    });
  });

  it('returns annotations from the module', () => {
    const annotations = {
      imports: [class {}],
      providers: [class {}],
      declarations: [class {}],
      exports: [class {}],
      schemas: [class {}],
    };
    @NgModule(annotations)
    class DummyModule {}

    expect(getNgModuleAnnotations(DummyModule)).toEqual(annotations);
  });
});
