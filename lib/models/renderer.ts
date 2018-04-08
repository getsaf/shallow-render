import { TestBed } from '@angular/core/testing';
import { Rendering, RenderOptions } from './rendering';
import { createContainer } from '../tools/create-container';
import { TestSetup } from './test-setup';
import { directiveResolver } from '../tools/reflect';
import { mockProvider } from '../tools/mock-provider';
import { copyTestModule } from '../tools/copy-test-module';

export class Renderer<TComponent> {
  constructor(private readonly _setup: TestSetup<TComponent>) {}

  async render<TBindings>(html?: string, options?: Partial<RenderOptions<TBindings>>) {
    const finalOptions = {
      detectChanges: true,
      bind: {} as TBindings,
      ...options,
    };

    const ComponentClass = html
      ? createContainer(html, finalOptions.bind)
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
    if (finalOptions.detectChanges) {
      fixture.detectChanges();
    }

    return new Rendering(fixture, finalOptions.bind, this._setup);
  }
}
