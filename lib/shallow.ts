import {
  Component,
  DebugElement,
  ModuleWithProviders,
  NgModule,
  Provider,
  Type,
  ValueProvider,
} from '@angular/core';
import { By, BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { MockPipe, MockComponent, MockDirective } from 'ng-mocks';

import { QueryMatch, QueryMatchClass, EmptyQueryMatch } from './models/query-match';
import { MockCache } from './models/mock-cache';
export type __junkType = DebugElement | ComponentFixture<any>; // To satisfy a TS build bug

export class ShallowContainer {}

export interface RenderOptions<TBindings> {
  detectChanges: boolean;
  bind: TBindings;
}

export interface Mocks<T> {
  class: Type<T>;
  stubs: Partial<T>;
}

export interface CopiedTestModuleMetadata {
  imports: (any[] | Type<any> | ModuleWithProviders)[];
  declarations: (any[] | Type<any>)[];
  providers: Provider[];
  exports: (Type<any> | any[])[];
  entryComponents: (any[] | Type<any>)[];
}

const isModuleWithProviders = (thing: any): thing is ModuleWithProviders => {
  const key: keyof ModuleWithProviders = 'ngModule';
  return key in thing;
};

const getType = (klass: any) => {
  if (Array.isArray(klass.__annotations__)
    && klass.__annotations__[0]
    && klass.__annotations__[0].__proto__
    && klass.__annotations__[0].__proto__.ngMetadataName
  ) {
    return klass.__annotations__[0].__proto__.ngMetadataName;
  }

  if (Array.isArray(klass.decorators)) {
    const fount = klass.decorators.find((d: any) => d.type && d.type.prototype && d.type.prototype.ngMetadataName);
    if (fount) {
      return fount.type.prototype.ngMetadataName;
    }
  }

  if (isModuleWithProviders(klass)) {
    return 'NgModule';
  }
  throw new Error(`Cannot find the declaration type for class ${klass.name || klass}`);
};

const getAnnotations = (ngModule: Type<any>): CopiedTestModuleMetadata => {
  let annotations: NgModule;
  const ngModuleAsAny = ngModule as any;
  if (Array.isArray(ngModuleAsAny.__annotations__)) {
    annotations = ngModuleAsAny.__annotations__[0];
  } else if (Array.isArray(ngModuleAsAny.decorators)) {
    annotations = ngModuleAsAny.decorators[0].args[0];
  } else {
    throw new Error(`Cannot find the annotations or decorator properties for class ${ngModule.name || ngModule}`);
  }

  const {
    imports = [] as (any[] | Type<any> | ModuleWithProviders)[],
    providers = [] as Provider[],
    declarations = [] as (any[] | Type<any>)[],
    exports = [] as (Type<any> | any[])[],
    entryComponents = [] as (any[] | Type<any>)[],
  } = annotations;

  return {imports, providers, declarations, exports, entryComponents};
};

export class MockProvider {
  constructor(public provider: any) {}
}

export class Shallow<TTestComponent> {
  // Never mock the Angular Common Module, it includes things like *ngIf and basic
  // template directives.
  private static readonly _neverMock: any[] = [CommonModule, BrowserModule];
  static neverMock(...things: any[]) {
    this._neverMock.push(...things);
    return Shallow;
  }

  private _ngMock<TThing>(thing: TThing, mockCache: MockCache): TThing {
    const cached = mockCache.find(thing);

    if (cached) {
      return cached;
    }

    if (Array.isArray(thing)) {
      return mockCache.add(thing, thing.map(t => this._ngMock(t, mockCache))) as any; // Recursion
    }

    if (!this._shouldMock(thing)) {
      return thing;
    }

    let mock: any;
    const type = getType(thing);
    switch (type) {
      case 'Component':
        mock = MockComponent(thing as any);
        break;
      case 'Directive':
        mock = MockDirective(thing as any);
        break;
      case 'Pipe':
        mock = MockPipe(thing as any);
        break;
      case 'NgModule':
        mock = this._mockModule(thing as any, mockCache);
        break;
      default:
        throw new Error(`Don't know how to mock type: ${type}`);
    }
    return mockCache.add(thing, mock);
  }

  constructor(private readonly _testComponentClass: Type<TTestComponent>, private readonly _fromModuleClass: Type<any>) {}

  private readonly _dontMock: any[] = [];
  dontMock(...things: any[]) {
    this._dontMock.push(...things);
    return this;
  }

  private get _allUnmocked(): Type<any>[] { return [this._testComponentClass, ...Shallow._neverMock, ...this._dontMock]; }

  private _shouldMock(thing: any) {
    return !this._allUnmocked.includes(thing);
  }

  private _copyTestModule(mockCache: MockCache) {
    const ngModule = getAnnotations(this._fromModuleClass);
    return {
      imports: this._ngMock(ngModule.imports, mockCache),
      declarations: this._ngMock(ngModule.declarations, mockCache),
      providers: ngModule.providers.map(p => this._mockProvider(p)),
    };
  }

  private _mockModule(mod: any[] | Type<any> | ModuleWithProviders, mockCache: MockCache): any[] | Type<any> {
    const cached = mockCache.find(mod);
    if (cached) {
      return cached as any[] | Type<any>;
    }
    let ngModule: CopiedTestModuleMetadata;
    let moduleClass: Type<any>;
    let providers: Provider[] = [];
    if (Array.isArray(mod)) {
      return mockCache.add(mod, mod.map(i => this._mockModule(i, mockCache))); // Recursion
    } else if (isModuleWithProviders(mod)) {
      moduleClass = mod.ngModule;
      if (mod.providers) {
        providers = mod.providers;
      }
    } else {
      moduleClass = mod as Type<any>;
    }
    ngModule = getAnnotations(moduleClass);
    const mockedModule: NgModule = {
      imports: ngModule.imports.map(i => this._ngMock(i, mockCache)),
      declarations: ngModule.declarations.map(i => this._ngMock(i, mockCache)),
      exports: ngModule.exports.map(i => this._ngMock(i, mockCache)),
      entryComponents: ngModule.entryComponents.map(i => this._ngMock(i, mockCache)),
      providers: ngModule.providers.concat(providers).map(i => this._mockProvider(i)),
    };
    @NgModule(mockedModule)
    class MockModule {}

    return mockCache.add(mod, MockModule);
  }

  private _mocks = [] as Mocks<any>[];
  mock<TMock>(mockClass: Type<TMock>, stubs: Partial<TMock>) {
    const mock = this._mocks.find(m => m.class === mockClass) || {class: mockClass, stubs: {}};
    Object.assign(mock.stubs, stubs);
    this._mocks = [...this._mocks.filter(m => m.class !== mockClass), mock];
    return this;
  }

  private _isValueProvider(provider: Provider): provider is ValueProvider {
    const key: keyof ValueProvider = 'useValue';
    return key in provider;
  }

  private _spyOnProvider(provider: Provider) {
    if (Array.isArray(provider)) {
      return provider.map(p => this._spyOnProvider); // Recursion
    } else {
      if (this._isValueProvider(provider)) {
        const {provide, useValue} = provider;
        if (provide && this._shouldMock(provide)) {
          Object.keys(useValue).forEach(key => {
            const value = useValue[key];
            if (typeof value === 'function') {
              spyOn(useValue, key).and.callThrough();
            }
          });

          return {provide, useValue};
        }
      }
      return provider;
    }
  }

  private _mockProvider(provider: Provider): Provider {
    let provide: any;

    if (typeof provider === 'function') {
      provide = provider;
    } else if (Array.isArray(provider)) {
      return provider.map(i => this._mockProvider(i));
    } else {
      provide = provider.provide;
    }

    const userProvidedMock = this._mocks.find(m => m.class === provide);
    if (userProvidedMock) {
      return {provide, useValue: Object.assign(new MockProvider(provide), userProvidedMock.stubs)};
    } else if (this._shouldMock(provider)) {
      return {provide, useValue: new MockProvider(provide)};
    } else {
      return provider;
    }
  }

  private _createContainerClass(html: string, bindings?: any) {
    @Component({
      selector: 'shallow-container',
      template: html,
    })
    class ProxyShallowContainer extends ShallowContainer {}
    Object.assign(ShallowContainer.prototype, this._spyOnMethods(bindings));

    return ProxyShallowContainer;
  }

  private _spyOnMethods<TObj>(obj: TObj): TObj {
    const anyObj = obj as any;
    Object.keys(anyObj).forEach(key => {
      const value = anyObj[key];
      if (typeof value === 'function') {
        spyOn(anyObj, key).and.callThrough();
      } else if (typeof value === 'object') {
        // NOTE: Recursion, too dangerous? Possible endless-loops
        // if a child referneces it's parent.
        this._spyOnMethods(value);
      }
    });
    return obj;
  }

  async render<TBindings>(html?: string, renderOptions?: Partial<RenderOptions<TBindings>>) {
    const options: RenderOptions<TBindings> = {
      detectChanges: true,
      bind: {} as RenderOptions<TBindings>,
      ...renderOptions,
    } as any;

    const mockCache = new MockCache();
    const {imports, providers, declarations} = this._copyTestModule(mockCache);
    const ComponentClass = html
      ? this._createContainerClass(html, options.bind)
      : this._testComponentClass;

    await TestBed
      .configureTestingModule({
        imports,
        providers: providers.map(p => this._spyOnProvider(p)),
        declarations: [...declarations, ComponentClass],
      })
      .compileComponents();

    const fixture = TestBed.createComponent(ComponentClass);

    const element = html
      ? fixture.debugElement.query(By.directive(this._testComponentClass))
      : fixture.debugElement;
    if (!element) {
      throw new Error(`${this._testComponentClass.name} was not found in test template: ${html}`);
    }
    const instance = element.injector.get(this._testComponentClass);

    const find = (cssOrDirective: string | Type<any>) => {
      if (cssOrDirective === this._testComponentClass) {
        throw new Error(`Don't use 'find' to search for your test component, it is automatically returned by the shallow renderer`);
      }
      const query = typeof cssOrDirective === 'string'
        ? By.css(cssOrDirective)
        : By.directive(mockCache.find(cssOrDirective));
      const matches = element.queryAll(query);
      if (matches.length === 0) {
        return (new EmptyQueryMatch() as any) as QueryMatch;
      }
      return QueryMatchClass.fromMatches(matches);
    };

    const findDirective = <TDirective>(directive: Type<TDirective>): TDirective | undefined => {
      const found = find(directive);
      if (found.length === 0) {
        return undefined;
      }
      return found.injector.get<TDirective>(mockCache.find(directive));
    };

    if (options.detectChanges) {
      fixture.detectChanges();
    }

    const get = <TClass>(queryClass: Type<TClass>): TClass => TestBed.get(queryClass);

    return {
      fixture: fixture as ComponentFixture<ShallowContainer>,
      element,
      find,
      findDirective,
      get,
      instance,
      bindings: options.bind
    };
  }
}
