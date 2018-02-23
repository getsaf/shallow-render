import { NgModule, Component, Input, Provider, Type, DebugElement } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { QueryMatch, EmptyQueryMatch } from './query-match';
import { MockModule, mockDeclaration } from 'mock-module';
export type __junkType = DebugElement | ComponentFixture<any>; // To satisfy a TS build bug

export class ShallowContainer {}

export interface RenderOptions<TBindings> {
  skipDetectChanges: boolean;
  bind: TBindings
}

export interface Mocks<T> {
  class: Type<T>;
  stubs: Partial<T>;
}

export interface CopiedTestModuleMetadata {
  imports: Array<Type<any>>;
  declarations: Array<Type<any>>;
  providers: Array<{
    provide: Type<any>;
    useValue: object;
  }>;
}

export class Shallow<T> {
  constructor(private readonly _testComponentClass: Type<T>, private readonly _fromModuleClass: Type<any>) {}

  private _copyTestModule(): CopiedTestModuleMetadata {
    const {imports = [], providers = [], declarations = []} =
      ((this._fromModuleClass as any).__annotations__[0]) as NgModule;
    const copy: CopiedTestModuleMetadata = {
      imports: [],
      declarations: [],
      providers: [],
    };

    if (Array.isArray(imports)) {
      copy.imports = imports.map(m => MockModule(m as Type<any>));
    }
    if (Array.isArray(declarations)) {
      copy.declarations = declarations
        .map(d => d === this._testComponentClass ? d : mockDeclaration(d as Type<any>));
    }
    if (Array.isArray(providers)) {
      copy.providers = providers.map(p => this._mockProvider(p));
    }

    return copy;
  }

  private _mocks = [] as Array<Mocks<any>>;
  mock<TMock>(mockClass: Type<TMock>, stubs: Partial<TMock>) {
    const mock = this._mocks.find(m => m.class === mockClass) || {class: mockClass, stubs: {}};
    Object.assign(mock.stubs, stubs);
    this._mocks = [...this._mocks.filter(m => m.class !== mockClass), mock];
    return this;
  }

  private _spyOnProvider(provider: {provide: Type<any>; useValue: any}) {
    const {provide, useValue} = provider;
    Object.keys(useValue).forEach(key => {
      const value = useValue[key];
      if (typeof value === 'function') {
        spyOn(useValue, key).and.callThrough();
      }
    });

    return {provide, useValue};
  }

  private _mockProvider(provider: Provider) {
    const mockProvider: Provider = {provide: undefined, useValue: {}};
    if (typeof provider === 'function') {
      mockProvider.provide = provider;
    } else if (Array.isArray(provider)) {
      throw new Error(`Array providers are not supported: ${provider}`);
    } else {
      mockProvider.provide = provider.provide;
    }

    const userProvidedMock = this._mocks.find(m => m.class === mockProvider.provide);
    if (userProvidedMock) {
      mockProvider.useValue = userProvidedMock.stubs;
    }

    return mockProvider;
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

  async render<TBindings>(html: string, renderOptions?: Partial<RenderOptions<TBindings>>) {
    const options: RenderOptions<TBindings> = {
      skipDetectChanges: false,
      bind: {} as RenderOptions<TBindings>,
      ...renderOptions,
    } as any;

    const containerClass = this._createContainerClass(html, options.bind);
    const {imports, providers, declarations} = this._copyTestModule();
    await TestBed
      .configureTestingModule({
        imports,
        providers: providers.map(p => this._spyOnProvider(p)),
        declarations: [...declarations, containerClass],
      })
      .compileComponents();

    const fixture = TestBed.createComponent(containerClass) as ComponentFixture<ShallowContainer>;

    const element = fixture.debugElement.query(By.directive(this._testComponentClass));
    if (!element) {
      throw new Error(`${this._testComponentClass.name} was not found in test template: ${html}`);
    }
    const instance = element.injector.get(this._testComponentClass);

    const find = (cssOrDirective: string | Type<any>) => {
      const query = typeof cssOrDirective === 'string'
        ? By.css(cssOrDirective)
        : By.directive(cssOrDirective === this._testComponentClass ? cssOrDirective : mockDeclaration(cssOrDirective));
      const matches = element.queryAll(query);
      if (matches.length === 0) {
        return (new EmptyQueryMatch() as any) as QueryMatch;
      }
      return new QueryMatch(matches);
    };

    if (!options.skipDetectChanges) {
      fixture.detectChanges();
    }

    const get = <TClass>(queryClass: Type<TClass>): TClass => element.injector.get(queryClass);

    return {
      TestBed,
      fixture,
      element,
      find,
      get,
      instance,
      bindings: options.bind
    };
  }
}
