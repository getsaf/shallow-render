import { CommonModule } from '@angular/common';
import { InjectionToken, PipeTransform, Provider, Type } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { RecursivePartial } from './models/recursive-partial';
import { InvalidStaticPropertyMockError, Renderer } from './models/renderer';
import { Rendering, RenderOptions } from './models/rendering';
import { TestSetup } from './models/test-setup';
import './test-frameworks/shallow-matchers';
import { AngularModule } from './models/angular-module';

const NEVER_MOCKED_ANGULAR_STUFF = [
  CommonModule,
  BrowserModule,
  FormsModule,
  ReactiveFormsModule,
  HAMMER_GESTURE_CONFIG,
];
export class Shallow<TTestComponent> {
  // tslint:disable: member-ordering
  readonly setup: TestSetup<TTestComponent>;

  // Never mock the Angular Common Module, it includes things like *ngIf and basic
  // template directives.
  private static readonly _neverMock: any[] = [...NEVER_MOCKED_ANGULAR_STUFF];
  static neverMock(...things: any[]) {
    this._neverMock.push(...things);
    return Shallow;
  }

  // Always add providers to the test module. This is useful to mimic the
  // Module.forRoot() pattern where dynamic things are provided at the app
  // root level. You can `alwaysProvide` root-only things to all your specs
  // with this method.
  private static readonly _alwaysProvide: Provider[] = [];
  static alwaysProvide(...providers: Provider[]) {
    this._alwaysProvide.push(...providers);
    return Shallow;
  }

  // Always mock a thing with a particular implementation.
  private static readonly _alwaysMock = new Map<Type<any> | InjectionToken<any>, any>();
  static alwaysMock<TProvider>(
    thing: Type<TProvider> | InjectionToken<TProvider>,
    stubs: RecursivePartial<TProvider>
  ): typeof Shallow {
    const mock = Shallow._alwaysMock.get(thing) || {};
    this._alwaysMock.set(thing, { ...mock, ...(stubs as object) });
    return Shallow;
  }

  private static readonly _alwaysMockPipes = new Map<
    PipeTransform | Type<PipeTransform>,
    // tslint:disable-next-line: ban-types
    Function
  >(); /* tslint:disable-line ban-types */
  static alwaysMockPipe<TPipe extends PipeTransform>(pipe: Type<TPipe>, transform: TPipe['transform']) {
    this._alwaysMockPipes.set(pipe, transform);
    return this;
  }

  // Always replace one module with another replacement module.
  private static readonly _alwaysReplaceModule = new Map<AngularModule, AngularModule>();
  static alwaysReplaceModule(originalModule: AngularModule, replacementModule: AngularModule): typeof Shallow {
    this._alwaysReplaceModule.set(originalModule, replacementModule);
    return Shallow;
  }

  private static readonly _alwaysImport: AngularModule[] = [];
  static alwaysImport(...imports: AngularModule[]) {
    this._alwaysImport.push(...imports);
    return Shallow;
  }

  private static _alwaysRenderStructuralDirectives = false;
  public static alwaysRenderStructuralDirectives() {
    this._alwaysRenderStructuralDirectives = true;
    return Shallow;
  }

  private static readonly _alwaysWithStructuralDirectives = new Map<Type<any>, boolean>();
  public static alwaysWithStructuralDirective(directive: Type<any>, renderContents: boolean = true) {
    this._alwaysWithStructuralDirectives.set(directive, renderContents);
    return Shallow;
  }

  constructor(testComponent: Type<TTestComponent>, testModule: AngularModule) {
    this.setup = new TestSetup(testComponent, testModule);
    this.setup.dontMock.push(testComponent, ...Shallow._neverMock);
    this.setup.providers.push(...Shallow._alwaysProvide);
    this.setup.imports.push(...Shallow._alwaysImport);
    this.setup.alwaysRenderStructuralDirectives = Shallow._alwaysRenderStructuralDirectives;
    Shallow._alwaysMock.forEach((value, key) => this.setup.mocks.set(key, value));
    Shallow._alwaysMockPipes.forEach((value, key) => this.setup.mockPipes.set(key, value));
    Shallow._alwaysReplaceModule.forEach((value, key) => this.setup.moduleReplacements.set(key, value));
    Shallow._alwaysWithStructuralDirectives.forEach((value, key) =>
      this.setup.withStructuralDirectives.set(key, value)
    );
  }

  withStructuralDirective(directive: Type<any>, renderContents = true) {
    this.setup.withStructuralDirectives.set(directive, renderContents);
    return this;
  }

  declare(...declarations: Type<any>[]): this {
    this.setup.declarations.push(...declarations);
    return this;
  }

  provide(...providers: Provider[]): this {
    this.setup.providers.push(...providers);
    return this;
  }

  provideMock(...providers: Provider[]): this {
    this.setup.providers.push(...providers);
    this.setup.dontMock.push(...providers);
    return this;
  }

  dontMock(...things: any[]): this {
    this.setup.dontMock.push(...things);
    return this;
  }

  mock<TMock>(thingToMock: Type<TMock> | InjectionToken<TMock>, stubs: RecursivePartial<TMock>): this {
    const mock = this.setup.mocks.get(thingToMock);
    if (typeof mock === 'object') {
      this.setup.mocks.set(thingToMock, { ...mock, ...(stubs as object) });
    } else {
      this.setup.mocks.set(thingToMock, stubs);
    }
    return this;
  }

  mockStatic<TMock extends object>(obj: TMock, stubs: RecursivePartial<TMock>): this {
    InvalidStaticPropertyMockError.checkMockForStaticProperties(stubs);
    const mock = this.setup.staticMocks.get(obj) || {};
    this.setup.staticMocks.set(obj, { ...mock, ...(stubs as object) });
    return this;
  }

  mockPipe<TPipe extends PipeTransform>(pipe: Type<TPipe>, transform: TPipe['transform']) {
    this.setup.mockPipes.set(pipe, transform);
    return this;
  }

  replaceModule(originalModule: AngularModule, replacementModule: AngularModule): this {
    this.setup.moduleReplacements.set(originalModule, replacementModule);
    return this;
  }

  import(...imports: AngularModule[]) {
    this.setup.imports.push(...imports);
    return this;
  }

  // Render no options, just the component and no bindings
  render(): Promise<Rendering<TTestComponent, never>>;

  render<TBindings>(
    html: string,
    renderOptions?: Partial<RenderOptions<TBindings>>
  ): Promise<Rendering<TTestComponent, TBindings>>;

  // Render with just renderOptions, means you must provide bindings that match
  // the TestComponent
  render<TBindings extends RecursivePartial<TTestComponent>>(
    renderOptions?: Partial<RenderOptions<TBindings>>
  ): Promise<Rendering<TTestComponent, TBindings>>;

  async render<TBindings>(
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
}
