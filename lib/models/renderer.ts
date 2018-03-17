import { TestBed } from '@angular/core/testing';
import { Type, Provider } from '@angular/core';
import { MockCache } from './mock-cache';
import { Rendering, RenderOptions } from './rendering';
import { createContainerComponent } from './container.factory';
import { copyTestModule } from '../tools/mock-module';
import { isValueProvider } from '../tools/type-checkers';

export class Renderer<TComponent, TModule> {
  constructor(
    private _testComponentClass: Type<TComponent>,
    private _testModule: Type<TModule>,
    private _dontMock: any[]
  ) {}

  private _spyOnProvider(provider: Provider) {
    if (Array.isArray(provider)) {
      return provider.map(p => this._spyOnProvider); // Recursion
    } else {
      if (isValueProvider(provider)) {
        const {provide, useValue} = provider;
        if (provide && !this._dontMock.includes(provide)) {
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

  async render<TBindings>(html?: string, options?: Partial<RenderOptions<TBindings>>) {
    const finalOptions = {
      detectChanges: true,
      bind: {} as TBindings,
      ...options,
    };

    const mockCache = new MockCache();
    const ComponentClass = html
      ? createContainerComponent(html, finalOptions.bind)
      : this._testComponentClass;

    const {imports, providers, declarations} = copyTestModule(this._testModule, mockCache, this._dontMock);
    await TestBed.configureTestingModule({
        imports,
        providers: providers.map(p => this._spyOnProvider(p)),
        declarations: [...declarations, ComponentClass],
      }).compileComponents();

    const fixture = TestBed.createComponent(ComponentClass);
    if (finalOptions.detectChanges) {
      fixture.detectChanges();
    }

    return new Rendering(
      this._testComponentClass,
      fixture,
      mockCache,
      finalOptions.bind,
    );
  }
}

