import { TestBed } from '@angular/core/testing';
import { Provider } from '@angular/core';
import { Rendering, RenderOptions } from './rendering';
import { createContainerComponent } from './container.factory';
import { copyTestModule } from '../tools/mock-module';
import { isValueProvider } from '../tools/type-checkers';
import { TestSetup } from './test-setup';

export class Renderer<TComponent> {
  constructor(private _setup: TestSetup<TComponent>) {}

  private _spyOnProvider(provider: Provider) {
    if (Array.isArray(provider)) {
      return provider.map(p => this._spyOnProvider); // Recursion
    } else {
      if (isValueProvider(provider)) {
        const {provide, useValue} = provider;
        if (provide && !this._setup.dontMock.includes(provide)) {
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

    const ComponentClass = html
      ? createContainerComponent(html, finalOptions.bind)
      : this._setup.testComponent;

    const {imports, providers, declarations} = copyTestModule(this._setup);
    await TestBed.configureTestingModule({
        imports,
        providers: providers.map(p => this._spyOnProvider(p)),
        declarations: [...declarations, ComponentClass],
      }).compileComponents();

    const fixture = TestBed.createComponent(ComponentClass);
    if (finalOptions.detectChanges) {
      fixture.detectChanges();
    }

    return new Rendering(fixture, finalOptions.bind, this._setup);
  }
}

