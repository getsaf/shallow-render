import { Component, Directive, EventEmitter, Input, NgModule, Output, Pipe, PipeTransform } from '@angular/core';
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

  describe('getInputsAndOutputs', () => {
    it('gets inputs and outputs', () => {
      @Component({ selector: 'my-component', template: '<div></div>' })
      class TestComponent {
        @Input() myInput!: string;
        @Output() myOutput = new EventEmitter<string>();
      }

      expect(reflect.getInputsAndOutputs(TestComponent)).toEqual({
        inputs: [{ alias: 'myInput', propertyName: 'myInput' }],
        outputs: [{ alias: 'myOutput', propertyName: 'myOutput' }],
      });
    });

    it('includes inherited inputs and outputs', () => {
      class BaseComponent {
        @Input() baseInput!: string;
        @Output() baseOutput = new EventEmitter<string>();
      }
      @Component({ selector: 'my-component', template: '<div></div>' })
      class TestComponent extends BaseComponent {
        @Input() myInput!: string;
        @Output() myOutput = new EventEmitter<string>();
      }

      expect(reflect.getInputsAndOutputs(TestComponent)).toEqual({
        inputs: [
          { alias: 'baseInput', propertyName: 'baseInput' },
          { alias: 'myInput', propertyName: 'myInput' },
        ],
        outputs: [
          { alias: 'baseOutput', propertyName: 'baseOutput' },
          { alias: 'myOutput', propertyName: 'myOutput' },
        ],
      });
    });

    it('returns input/output aliases', () => {
      @Component({ selector: 'my-component', template: '<div></div>' })
      class TestComponent {
        @Input('inputAlias') myInput!: string;
        @Output('outputAlias') myOutput = new EventEmitter<string>();
      }

      expect(reflect.getInputsAndOutputs(TestComponent)).toEqual({
        inputs: [{ alias: 'inputAlias', propertyName: 'myInput' }],
        outputs: [{ alias: 'outputAlias', propertyName: 'myOutput' }],
      });
    });

    it('prefers lowest level of inherited inputs and outputs', () => {
      class BaseComponent {
        @Input('this-input-alias-wont-show') myInput!: string;
        @Output('this-output-alias-wont-show') myOutput = new EventEmitter<string>();
      }

      @Component({ selector: 'my-component', template: '<div></div>' })
      class TestComponent extends BaseComponent {
        @Input() myInput!: string;
        @Output() myOutput = new EventEmitter<string>();
      }

      expect(reflect.getInputsAndOutputs(TestComponent)).toEqual({
        inputs: [{ alias: 'myInput', propertyName: 'myInput' }],
        outputs: [{ alias: 'myOutput', propertyName: 'myOutput' }],
      });
    });
  });
});
