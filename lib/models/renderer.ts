import { EventEmitter } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Rendering, RenderOptions } from './rendering';
import { createContainer } from '../tools/create-container';
import { TestSetup } from './test-setup';
import { directiveResolver } from '../tools/reflect';
import { mockProvider } from '../tools/mock-provider';
import { copyTestModule } from '../tools/copy-test-module';

export class InvalidInputBindError {
  message = `Tried to bind to a property that is not marked as @Input: ${this.key}\nAvailable input bindings: ${this.availableInputs}`;
  constructor(public availableInputs: string[], public key: string) {}
}

export class Renderer<TComponent> {
  constructor(private readonly _setup: TestSetup<TComponent>) {}

  render<TBindings extends Partial<TComponent>>(
    options: Partial<RenderOptions<TBindings>>
  ): Promise<Rendering<TComponent, TBindings>>;

  render<TBindings>(
    template?: string,
    options?: Partial<RenderOptions<TBindings>>
  ): Promise<Rendering<TComponent, TBindings>>;

  async render<TBindings>(
    templateOrOptions?: string | Partial<RenderOptions<TBindings>>,
    optionsOrUndefined?: Partial<RenderOptions<TBindings>>
  ) {
    const [template, options] = typeof templateOrOptions === 'string'
      ? [templateOrOptions, optionsOrUndefined]
      : [undefined, templateOrOptions];

    const finalOptions = {
      detectChanges: true,
      bind: {} as TBindings,
      ...options,
    };

    const ComponentClass = template
      ? createContainer(template, finalOptions.bind)
      : this._setup.testComponent;

    // Components may have their own providers, If the test component does,
    // we will mock them out here..
    const resolvedTestComponent = directiveResolver.resolve(this._setup.testComponent);
    if (resolvedTestComponent.providers && resolvedTestComponent.providers.length) {
      TestBed.overrideComponent(this._setup.testComponent, {
        set: {
          providers: resolvedTestComponent.providers.map(p => mockProvider(p, this._setup))
        }
      });
    }

    const {imports, providers, declarations} = copyTestModule(this._setup);
    await TestBed.configureTestingModule({
        imports,
        providers,
        declarations: [...declarations, ComponentClass],
      }).compileComponents();

    const fixture = TestBed.createComponent(ComponentClass);
    const rendering = new Rendering(fixture, finalOptions.bind, this._setup);

    if (resolvedTestComponent.outputs) {
      resolvedTestComponent.outputs.forEach(k => {
        const value = (rendering.instance as any)[k];
        if (value && value instanceof EventEmitter) {
          spyOn(value, 'emit').and.callThrough();
        }
      });
    }

    if (!template) {
      // If no template is used, the bindings should go directly to the
      // component @Inputs
      const inputPropertyNames = (resolvedTestComponent.inputs || [])
        .map(k => k.split(':')[0]);
      Object.keys(finalOptions.bind).forEach(k => {
        if (!inputPropertyNames.includes(k)) {
          throw new InvalidInputBindError(inputPropertyNames, k);
        }
        (rendering.instance as any)[k] = (finalOptions.bind as any)[k];
      });
    }

    if (finalOptions.detectChanges) {
      fixture.detectChanges();
    }

    return rendering;
  }
}
