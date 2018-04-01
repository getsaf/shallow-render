import { InjectionToken, Type, PipeTransform, Provider } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { RenderOptions, Rendering } from './models/rendering';
import { Renderer } from './models/renderer';
import { TestSetup } from './models/test-setup';

export class Shallow<TTestComponent> {
  readonly setup: TestSetup<TTestComponent>;

  // Never mock the Angular Common Module, it includes things like *ngIf and basic
  // template directives.
  private static readonly _neverMock: any[] = [CommonModule, BrowserModule];
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
  static alwaysMock<TProvider>(thing: Type<TProvider> | InjectionToken<TProvider>, stubs: Partial<TProvider>): typeof Shallow {
    const mock = Shallow._alwaysMock.get(thing) || {};
    Shallow._alwaysMock.set(thing, {...mock, ...stubs as object});
    return Shallow;
  }

  constructor(testComponent: Type<TTestComponent>, testModule: Type<any>) {
    this.setup = new TestSetup(testComponent, testModule);
    this.setup.dontMock.push(...Shallow._neverMock);
    this.setup.providers.push(...Shallow._alwaysProvide);
    Shallow._alwaysMock.forEach((value, key) => this.setup.mocks.set(key, value));
  }

  provide(...providers: Provider[]) {
    this.setup.providers.push(...providers);
    return this;
  }

  dontMock(...things: any[]) {
    this.setup.dontMock.push(...things);
    return this;
  }

  mock<TMock>(mockClass: Type<TMock> | InjectionToken<TMock>, stubs: Partial<TMock>) {
    const mock = this.setup.mocks.get(mockClass) || {};
    this.setup.mocks.set(mockClass, {...mock, ...stubs as object});
    return this;
  }

  mockPipe<TPipe extends PipeTransform>(pipe: Type<TPipe>, transform: TPipe['transform']) {
    this.setup.mockPipes.set(pipe, transform);
    return this;
  }

  async render<TBindings>(html?: string, renderOptions?: Partial<RenderOptions<TBindings>>): Promise<Rendering<TTestComponent, TBindings>> {
    const renderer = new Renderer(this.setup);
    return renderer.render(html, renderOptions);
  }
}
