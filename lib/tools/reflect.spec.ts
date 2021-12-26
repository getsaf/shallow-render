import { Component, Directive, NgModule, Pipe, PipeTransform } from '@angular/core';
import { reflect } from './reflect';
describe('reflect', () => {
  @Directive({ selector: 'foo-directive' })
  class MyDirective {}

  @Component({ selector: 'foo-component', template: '<div></div>' })
  class MyComponent {}

  @Pipe({ name: 'foo' })
  class MyPipe implements PipeTransform {
    transform(input: string) {
      return input;
    }
  }

  @NgModule({})
  class MyModule {}

  class NonAngularClass {}

  it('identifies components', () => {
    expect(reflect.isComponent(MyComponent)).toBe(true);

    expect(reflect.isComponent(MyDirective)).toBe(false);
    expect(reflect.isComponent(MyModule)).toBe(false);
    expect(reflect.isComponent(NonAngularClass)).toBe(false);
    expect(reflect.isComponent(MyPipe)).toBe(false);
  });

  it('identifies directives', () => {
    expect(reflect.isDirective(MyDirective)).toBe(true);
    // Components are directives but not vice versa
    expect(reflect.isDirective(MyComponent)).toBe(true);

    expect(reflect.isDirective(MyModule)).toBe(false);
    expect(reflect.isDirective(NonAngularClass)).toBe(false);
    expect(reflect.isDirective(MyPipe)).toBe(false);
  });

  it('identifies modules', () => {
    expect(reflect.isNgModule(MyModule)).toBe(true);

    expect(reflect.isNgModule(MyDirective)).toBe(false);
    expect(reflect.isNgModule(MyComponent)).toBe(false);
    expect(reflect.isNgModule(NonAngularClass)).toBe(false);
    expect(reflect.isNgModule(MyPipe)).toBe(false);
  });

  it('identifies pipes', () => {
    expect(reflect.isPipe(MyPipe)).toBe(true);

    expect(reflect.isPipe(MyModule)).toBe(false);
    expect(reflect.isPipe(MyDirective)).toBe(false);
    expect(reflect.isPipe(MyComponent)).toBe(false);
    expect(reflect.isPipe(NonAngularClass)).toBe(false);
  });
});
