/* eslint-disable @angular-eslint/no-outputs-metadata-property */
/* eslint-disable @angular-eslint/no-inputs-metadata-property */
import {
  Component,
  Directive,
  EventEmitter,
  Input,
  NgModule,
  Output,
  Pipe,
  PipeTransform,
  input,
  output,
} from '@angular/core';
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

  it('identifies things that are marked as "standalone"', () => {
    // Not standalone
    expect(reflect.isStandalone(MyModule)).toBe(false);
    expect(reflect.isStandalone(MyDirective)).toBe(false);
    expect(reflect.isStandalone(MyComponent)).toBe(false);
    expect(reflect.isStandalone(NonAngularClass)).toBe(false);

    // Standalone things
    @Component({ standalone: true })
    class MyStandaloneComponent {}
    expect(reflect.isStandalone(MyStandaloneComponent)).toBe(true);

    @Directive({ standalone: true })
    class MyStandaloneDirective {}
    expect(reflect.isStandalone(MyStandaloneDirective)).toBe(true);

    @Pipe({ name: 'standalone-pipe', standalone: true })
    class MyStandalonePipe implements PipeTransform {
      transform = () => 'test';
    }
    expect(reflect.isStandalone(MyStandalonePipe)).toBe(true);
  });

  describe('getInputsAndOutputs', () => {
    it('gets inputs and outputs', () => {
      @Component({ selector: 'my-component', template: '<div></div>' })
      class TestComponent {
        @Input() myInput!: string;
        @Input({required: true}) myRequiredInput!: string;
        @Output() myOutput = new EventEmitter<string>();
      }

      expect(reflect.getInputsAndOutputs(TestComponent)).toEqual({
        inputs: [
          { alias: 'myInput', propertyName: 'myInput' },
          { alias: 'myRequiredInput', propertyName: 'myRequiredInput' }
        ],
        outputs: [{ alias: 'myOutput', propertyName: 'myOutput' }],
      });
    });

    it('gets signal inputs and outputs', () => {
      @Component({ selector: 'my-component', template: '<div></div>' })
      class TestComponent {
        myInput = input<string>();
        myRequiredInput = input.required<string>();
       myOutput = output<string>();
      }

      expect(reflect.getInputsAndOutputs(TestComponent)).toEqual({
        inputs: [
          { alias: 'myInput', propertyName: 'myInput' },
          { alias: 'myRequiredInput', propertyName: 'myRequiredInput' }
        ],
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
        @Input({alias: 'requiredInputAlias', required: true}) myRequiredInput!: string;
        @Output('outputAlias') myOutput = new EventEmitter<string>();
      }

      expect(reflect.getInputsAndOutputs(TestComponent)).toEqual({
        inputs: [
          { alias: 'inputAlias', propertyName: 'myInput' },
          { alias: 'requiredInputAlias', propertyName: 'myRequiredInput' }
        ],
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

    it('returns inputs and outputs defined in the component metadata', () => {
      @Component({
        selector: 'my-component',
        template: '<div></div>',
        inputs: ['inputOne', 'inputTwo'],
        outputs: ['outputOne', 'outputTwo'],
      })
      class TestComponent {}

      expect(reflect.getInputsAndOutputs(TestComponent)).toEqual({
        inputs: [
          { alias: 'inputOne', propertyName: 'inputOne' },
          { alias: 'inputTwo', propertyName: 'inputTwo' },
        ],
        outputs: [
          { alias: 'outputOne', propertyName: 'outputOne' },
          { alias: 'outputTwo', propertyName: 'outputTwo' },
        ],
      });
    });

    it('returns extended inputs and outputs defined in the component metadata', () => {
      @Component({
        selector: 'base-component',
        template: '<div></div>',
        inputs: ['baseInputOne', 'baseInputTwo'],
        outputs: ['baseOutputOne', 'baseOutputTwo'],
      })
      class BaseComponent {}

      @Component({
        selector: 'my-component',
        template: '<div></div>',
        inputs: ['extendedInputOne', 'extendedInputTwo'],
        outputs: ['extendedOutputOne', 'extendedOutputTwo'],
      })
      class TestComponent extends BaseComponent {}

      expect(reflect.getInputsAndOutputs(TestComponent)).toEqual({
        inputs: [
          { alias: 'baseInputOne', propertyName: 'baseInputOne' },
          { alias: 'baseInputTwo', propertyName: 'baseInputTwo' },
          { alias: 'extendedInputOne', propertyName: 'extendedInputOne' },
          { alias: 'extendedInputTwo', propertyName: 'extendedInputTwo' },
        ],
        outputs: [
          { alias: 'baseOutputOne', propertyName: 'baseOutputOne' },
          { alias: 'baseOutputTwo', propertyName: 'baseOutputTwo' },
          { alias: 'extendedOutputOne', propertyName: 'extendedOutputOne' },
          { alias: 'extendedOutputTwo', propertyName: 'extendedOutputTwo' },
        ],
      });
    });

    it('returns extended inputs and outputs defined in the component metadata and with decorators', () => {
      @Component({
        selector: 'base-component',
        template: '<div></div>',
        inputs: ['baseInputOne', 'baseInputTwo'],
        outputs: ['baseOutputOne', 'baseOutputTwo'],
      })
      class BaseComponent {
        @Input() baseInput!: string;
        @Output() baseOutput = new EventEmitter<string>();
      }

      @Component({
        selector: 'my-component',
        template: '<div></div>',
        inputs: ['extendedInputOne', 'extendedInputTwo'],
        outputs: ['extendedOutputOne', 'extendedOutputTwo'],
      })
      class TestComponent extends BaseComponent {
        @Input() extendedInput!: string;
        @Output() extendedOutput = new EventEmitter<string>();
      }

      expect(reflect.getInputsAndOutputs(TestComponent)).toEqual({
        inputs: [
          { alias: 'baseInput', propertyName: 'baseInput' },
          { alias: 'baseInputOne', propertyName: 'baseInputOne' },
          { alias: 'baseInputTwo', propertyName: 'baseInputTwo' },
          { alias: 'extendedInput', propertyName: 'extendedInput' },
          { alias: 'extendedInputOne', propertyName: 'extendedInputOne' },
          { alias: 'extendedInputTwo', propertyName: 'extendedInputTwo' },
        ],
        outputs: [
          { alias: 'baseOutput', propertyName: 'baseOutput' },
          { alias: 'baseOutputOne', propertyName: 'baseOutputOne' },
          { alias: 'baseOutputTwo', propertyName: 'baseOutputTwo' },
          { alias: 'extendedOutput', propertyName: 'extendedOutput' },
          { alias: 'extendedOutputOne', propertyName: 'extendedOutputOne' },
          { alias: 'extendedOutputTwo', propertyName: 'extendedOutputTwo' },
        ],
      });
    });
  });
});
