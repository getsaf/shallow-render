import { CommonModule } from '@angular/common';
import { InjectionToken, PipeTransform, Provider, Type } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { RecursivePartial } from './models/recursive-partial';
import { Renderer } from './models/renderer';
import { Rendering, RenderOptions } from './models/rendering';
import { TestSetup } from './models/test-setup';
import './test-frameworks/shallow-matchers';
import { AngularModule } from './models/angular-module';
import { InvalidStaticPropertyMockError } from './tools/mock-statics';
import { createService } from './tools/create-service';

/**
 * Test setup wrapper. This class tracks all the test module configurations including
 * mocks and providers. When the test setup is complete, you can render with the `render` method.
 */
export class Shallow<TTestTarget extends object> {
  readonly setup: TestSetup<TTestTarget>;

  /**
   * Instruct *all* shallow-render tests to prevent mocking of a particular:
   * * Service
   * * Directive
   * * Component
   * * Module
   * * InjectionToken
   * * PipeTransform
   *
   * NOTE: Designed to be used in a global test setup
   * If you wish to avoid mocking for a specific test (or test file) @see Shallow#dontMock
   */
  static neverMock(...things: any[]) {
    this._neverMock.push(...things);
    return Shallow;
  }
  private static readonly _neverMock: any[] = [];

  /**
   * Instruct *all* shallow-render tests to always add providers to the test module.
   * This is useful to mimic the
   * Module.forRoot() pattern where dynamic injectables are provided at the app
   * root level. You can `alwaysProvide` root-only injectables to all your specs
   * with this method.
   *
   * NOTE: Designed to be used in a global test setup
   * If you wish to add a provider for a specific test (or test file) @see Shallow#provide
   *
   * https://getsaf.github.io/shallow-render/#global-providers-with-alwaysprovide
   */
  static alwaysProvide(...providers: Provider[]) {
    this._alwaysProvide.push(...providers);
    return Shallow;
  }
  private static readonly _alwaysProvide: Provider[] = [];

  /**
   * Instruct *all* shallow-render tests to always mock an injectable in a particular way.
   *
   * NOTE: Designed to be used in a global test setup
   * If you wish to add a provider for a specific test (or test file) @see Shallow#mock
   *
   *
   * @example
   *   Shallow.alwaysMock(MyService, {fetchItems: () => Promise.resolve(['one', 'two', 'three'])});
   *
   *  @link https://getsaf.github.io/shallow-render/#global-mocks-with-alwaysmock
   */
  static alwaysMock<TProvider>(
    thing: Type<TProvider> | InjectionToken<TProvider>,
    stubs: RecursivePartial<TProvider>
  ): typeof Shallow {
    const mock = Shallow._alwaysMock.get(thing) || {};
    this._alwaysMock.set(thing, { ...mock, ...(stubs as object) });
    return Shallow;
  }
  private static readonly _alwaysMock = new Map<Type<any> | InjectionToken<any>, any>();

  /**
   * Instruct *all* shallow-render tests to always mock pipes.
   *
   * NOTE: Designed to be used in a global test setup
   * If you wish to mock a pipe for a specific test (or test file) @see Shallow#mockPipe
   *
   * @link https://getsaf.github.io/shallow-render/#mocking-pipes-with-mockpipe
   */
  static alwaysMockPipe<TPipe extends PipeTransform>(pipe: Type<TPipe>, transform: TPipe['transform']) {
    this._alwaysMockPipes.set(pipe, transform);
    return this;
  }
  // eslint-disable-next-line @typescript-eslint/ban-types
  private static readonly _alwaysMockPipes = new Map<PipeTransform | Type<PipeTransform>, Function>();

  /**
   * Instruct *all* shallow-render tests to replace references to one module with another module.
   *
   * This can be useful to automatically inject "test" modules in your tests.
   *
   * @example
   * Shallow.alwaysReplaceModule(HTTPClientModule, HTTPClientTestingModule);
   *
   * NOTE: Designed to be used in a global test setup
   * If you wish to replace modules for a specific test (or test file) @see Shallow#replaceModule
   *
   * @link https://getsaf.github.io/shallow-render/#replace-a-module-with-a-test-module
   */
  static alwaysReplaceModule(originalModule: AngularModule, replacementModule: AngularModule): typeof Shallow {
    this._alwaysReplaceModule.set(originalModule, replacementModule);
    return Shallow;
  }
  private static readonly _alwaysReplaceModule = new Map<AngularModule, AngularModule>();

  /**
   * Instruct *all* shallow-render tests to import a given `AngularModule`.
   *
   * NOTE: Designed to be used in a global test setup
   * If you wish to import modules for a specific test (or test file) @see Shallow#import
   */
  static alwaysImport(...imports: AngularModule[]) {
    this._alwaysImport.push(...imports);
    return Shallow;
  }
  private static readonly _alwaysImport: AngularModule[] = [];

  /**
   * Instruct *all* shallow-render tests to always render templates associated with
   * mocked structural directives. The default behavior is not to render structural directives
   * until the user specifically enables the directive in their test.
   *
   * @see Shallow.alwaysWithStructuralDirective
   * @see Rendering#renderStructuralDirective
   *
   * NOTE: Designed to be used in a global test setup
   * If you wish to control structural directives manually in a specific test (or test file) @see Rendering#renderStructuralDirective
   *
   * @link https://getsaf.github.io/shallow-render/#structural-directives
   */
  public static alwaysRenderStructuralDirectives() {
    this._alwaysRenderStructuralDirectives = true;
    return Shallow;
  }
  private static _alwaysRenderStructuralDirectives = false;

  /**
   * Instruct *all* shallow-render tests to enforce the default render state of a given directive.
   *
   * This can be useful when you have certain structural directives that are commonly desired to be
   * have their contents rendered in your tests.
   *
   * --or--
   *
   * If you want to render all structural directives by default but toggle certain ones off.
   *
   * @see Shallow.alwaysRenderStructuralDirectives
   * @see Rendering#renderStructuralDirective
   *
   * NOTE: Designed to be used in a global test setup
   * If you wish to control structural directives manually in a specific test (or test file) @see Rendering#renderStructuralDirective
   *
   * @link https://getsaf.github.io/shallow-render/#structural-directives
   */
  public static alwaysWithStructuralDirective(directive: Type<any>, renderContents = true) {
    this._alwaysWithStructuralDirectives.set(directive, renderContents);
    return Shallow;
  }
  private static readonly _alwaysWithStructuralDirectives = new Map<Type<any>, boolean>();

  constructor(testComponentOrService: Type<TTestTarget>, testModule?: AngularModule) {
    this.setup = new TestSetup(testComponentOrService, testModule);
    this.setup.dontMock.push(...Shallow._neverMock);
    this.setup.providers.unshift(...Shallow._alwaysProvide);
    this.setup.imports.push(...Shallow._alwaysImport);
    this.setup.alwaysRenderStructuralDirectives = Shallow._alwaysRenderStructuralDirectives;
    Shallow._alwaysMock.forEach((value, key) => this.setup.mocks.set(key, value));
    Shallow._alwaysMockPipes.forEach((value, key) => this.setup.mockPipes.set(key, value));
    Shallow._alwaysReplaceModule.forEach((value, key) => this.setup.moduleReplacements.set(key, value));
    Shallow._alwaysWithStructuralDirectives.forEach((value, key) =>
      this.setup.withStructuralDirectives.set(key, value)
    );
  }

  /**
   * Enforce the default render state of a given directive's contents.
   *
   * Note: If you wish to control structural directives globally @see Shallow.alwaysWithStructuralDirective
   *
   * @link https://getsaf.github.io/shallow-render/#structural-directives
   */
  withStructuralDirective(directive: Type<any>, renderContents = true) {
    this.setup.withStructuralDirectives.set(directive, renderContents);
    return this;
  }

  /**
   * Adds a component/directive to the test module's `declarations` array.
   *
   * NOTE: Generally speaking, your declarations should be supplied in your modules. Use of this function
   * should be taken with caution because it can mask issues with missing declarations in your modules.
   */
  declare(...declarations: Type<any>[]): this {
    this.setup.declarations.push(...declarations);
    return this;
  }

  /**
   * Adds a provider to the test module's `providers` array.
   *
   * Can be useful to supply Singleton services (aka: services that are `providedIn: 'root'`).
   *
   * Providers can match any structure allowed Angular's module system
   *
   * @example
   * shallow.pro({ provide: MyService, useClass: MyMockService });
   *
   * @link https://getsaf.github.io/shallow-render/#use-a-manual-mock-instance-or-class
   */
  provide(...providers: Provider[]): this {
    this.setup.providers.unshift(...providers);
    return this;
  }

  /**
   * Adds a pre-defined and pre-mocked provider to the test module. Useful when you have
   * a test-double service that you wish to use instead of a given service:
   *
   * Providers can match any structure allowed Angular's module system
   *
   * @example
   * shallow.provideMock({ provide: MyService, useClass: MyMockService });
   *
   * @link https://getsaf.github.io/shallow-render/#use-a-manual-mock-instance-or-class
   */
  provideMock(...providers: Provider[]): this {
    this.setup.providers.unshift(...providers);
    this.setup.dontMock.push(...providers);
    return this;
  }

  /**
   * Instructs shallow to avoid mocking a particular injectable in a test.
   *
   * This can be any of the following types:
   * * Service
   * * Directive
   * * Component
   * * Module
   * * InjectionToken
   * * PipeTransform
   *
   * @example
   * // While testing a ListComponent, you may want to use the *real* child component too
   * shallow.dontMock(ListItemComponent)
   *
   * @link https://getsaf.github.io/shallow-render/#skip-mocking-with-dontmock
   */
  dontMock(...things: any[]): this {
    this.setup.dontMock.push(...things);
    return this;
  }

  /**
   * Provides mock functions and properties to your test module for a given injectable.
   *
   * @example
   * shallow.mock(MyService, {fetchItems: () => Promise.resolve(['one', 'two', 'three'])});
   *
   * @link https://getsaf.github.io/shallow-render/#mocking
   */
  mock<TMock>(thingToMock: Type<TMock> | InjectionToken<TMock>, stubs: RecursivePartial<TMock>): this {
    const mock = this.setup.mocks.get(thingToMock);
    if (typeof mock === 'object') {
      this.setup.mocks.set(thingToMock, { ...mock, ...(stubs as object) });
    } else {
      this.setup.mocks.set(thingToMock, stubs);
    }
    return this;
  }

  /**
   * Allows mocking static properties (or properties of plain JS objects) in your test.
   *
   * Note: These mocks are reset after your test completes so there is no data-bleed between tests.
   *
   * @example
   * shallow.mockStatic(STATIC_STATUS_CONFIG, {customStatus: 'Mock Status Value Here'});
   *
   * @link https://getsaf.github.io/shallow-render/#static-function-mocks
   */
  mockStatic<TMock extends object>(obj: TMock, stubs: RecursivePartial<TMock>): this {
    InvalidStaticPropertyMockError.checkMockForStaticProperties(stubs);
    const mock = this.setup.staticMocks.get(obj) || {};
    this.setup.staticMocks.set(obj, { ...mock, ...(stubs as object) });
    return this;
  }

  /**
   * Mocks a pipe to transform in a specific way for your test.
   *
   * By default, all pipes are mocked to simply return the same value that was input as their output
   *
   * @example
   * // Fake the translate pipe to do simple text reversal
   * shallow.mockPipe(TranslatePipe, input => input.split('').reverse().join(''));
   *
   * @link https://getsaf.github.io/shallow-render/#mocking-pipes-with-mockpipe
   */
  mockPipe<TPipe extends PipeTransform>(pipe: Type<TPipe>, transform: TPipe['transform']) {
    this.setup.mockPipes.set(pipe, transform);
    return this;
  }

  /**
   * Replace any reference to a module with a different module
   *
   * This can be useful to automatically inject "test" modules in your tests.
   *
   * NOTE: If you wish to replace modules globally @see Shallow.alwaysReplaceModule
   *
   * @example
   * shallow.replaceModule(HTTPClientModule, HTTPClientTestingModule);
   *
   * @link https://getsaf.github.io/shallow-render/#replace-a-module-with-a-test-module
   */
  replaceModule(originalModule: AngularModule, replacementModule: AngularModule): this {
    this.setup.moduleReplacements.set(originalModule, replacementModule);
    return this;
  }

  /**
   * Adds imports to the TestModule
   *
   * Note: If you wish to import modules globally @see Shallow#import
   */
  import(...imports: AngularModule[]) {
    this.setup.imports.push(...imports);
    return this;
  }

  /**
   * Renders the test component
   *
   * You may optionally supply custom bindings to your template.
   *
   * @example
   * const rendering = await shallow.render(
   *   '<my-component [myLabel]="label" [myFlag]="flag" (myOutput)="output"></my-component>',
   *   {
   *     bind: {
   *       label: "Foo",
   *       flag: true,
   *       output: () => console.log("output fired"),
   *     },
   *   }
   * );
   *
   * @link https://getsaf.github.io/shallow-render/#rendering
   */
  render(): Promise<Rendering<TTestTarget, never>>;

  /**
   * Renders the test component with an HTML template.
   *
   * You may optionally supply custom bindings to your template.
   *
   * @example
   * const rendering = await shallow.render(
   *   '<my-component [myLabel]="label" [myFlag]="flag" (myOutput)="output"></my-component>',
   *   {
   *     bind: {
   *       label: "Foo",
   *       flag: true,
   *       output: () => console.log("output fired"),
   *     },
   *   }
   * );
   *
   * @link https://getsaf.github.io/shallow-render/#rendering
   */
  render<TBindings>(
    html: string,
    renderOptions?: Partial<RenderOptions<TBindings>>
  ): Promise<Rendering<TTestTarget, TBindings>>;

  /**
   * Renders the test component
   *
   * You may optionally supply custom bindings to your template.
   *
   * @example
   * const rendering = await shallow.render(
   *   '<my-component [myLabel]="label" [myFlag]="flag" (myOutput)="output"></my-component>',
   *   {
   *     bind: {
   *       label: "Foo",
   *       flag: true,
   *       output: () => console.log("output fired"),
   *     },
   *   }
   * );
   *
   * @link https://getsaf.github.io/shallow-render/#rendering
   */
  render<TBindings extends RecursivePartial<TTestTarget>>(
    renderOptions?: Partial<RenderOptions<TBindings>>
  ): Promise<Rendering<TTestTarget, TBindings>>;

  async render<TBindings extends RecursivePartial<TTestTarget>>(
    htmlOrRenderOptions?: string | Partial<RenderOptions<TBindings>>,
    renderOptions?: Partial<RenderOptions<TBindings>>
  ) {
    const renderer = new Renderer(this.setup);
    if (typeof htmlOrRenderOptions === 'string') {
      return renderer.render(htmlOrRenderOptions, renderOptions);
    } else if (htmlOrRenderOptions !== undefined) {
      return renderer.render(htmlOrRenderOptions);
    } else {
      return renderer.render();
    }
  }

  /**
   * Creates an instance of a service for testing.
   *
   * Services can be tested in a similar manner as components.
   *
   * @example
   * const shallow = new Shallow(MyService, MyModule).mock(DependentService, {get: () => 'mocked!'})
   * const {instance} = shallow.createService;
   *
   * @link https://getsaf.github.io/shallow-render/#testing-services
   */
  createService() {
    return createService(this.setup);
  }
}

Shallow.neverMock(CommonModule, BrowserModule, FormsModule, ReactiveFormsModule, HAMMER_GESTURE_CONFIG);
