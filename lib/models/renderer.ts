import { Directive, EventEmitter, Type } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Rendering, RenderOptions } from './rendering';
import { createContainer } from '../tools/create-container';
import { TestSetup } from './test-setup';
import { directiveResolver } from '../tools/reflect';
import { mockProvider } from '../tools/mock-provider';
import { copyTestModule } from '../tools/copy-test-module';
import { By } from '@angular/platform-browser';

export class InvalidInputBindError {
  message = `Tried to bind to a property that is not marked as @Input: ${this.key}\nAvailable input bindings: ${this.availableInputs}`;
  constructor(public availableInputs: string[], public key: string) {}
}

export class MissingTestComponentError {
  message = `${this.testComponent.name} was not found in test template`;
  constructor(public testComponent: Type<any>) {}
}

export class InvalidStaticPropertyMockError {
  static checkMockForStaticProperties(stubs: object) {
    Object.keys(stubs).forEach(key => {
      if (typeof (stubs as any)[key] !== 'function') {
        throw new InvalidStaticPropertyMockError(key);
      }
    });
  }

  public readonly message: string;
  constructor(key: string | symbol) {
    this.message = `Tried to mock the '${key}' property but only functions are supported for static mocks.`;
  }
}

export class Renderer<TComponent> {
  constructor(private readonly _setup: TestSetup<TComponent>) {}

  private _mockStatics() {
    this._setup.staticMocks.forEach((stubs, obj) => {
      InvalidStaticPropertyMockError
        .checkMockForStaticProperties(stubs);
      Object.keys(stubs).forEach(key => {
        const stub = stubs[key];
        if (!(jasmine as any).isSpy(obj[key])) {
          spyOn(obj, key).and.callFake(stub);
        } else {
          const spy = obj[key] as jasmine.Spy;
          spy.calls.reset();
          spy.and.callFake(stub);
        }
      });
    });
  }

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

    const finalOptions: RenderOptions<TBindings> = {
      detectChanges: true,
      whenStable: true,
      bind: {} as TBindings,
      ...options,
    };

    // Go ahead and mock static things
    this._mockStatics();

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
    const instance = this._getInstance(fixture);

    this._spyOnOutputs(instance, resolvedTestComponent);

    if (!template) {
      // If no template is used, the bindings should go directly to the
      // component @Inputs
      this._bindInputsDirectlyToComponent(instance, resolvedTestComponent, finalOptions.bind);
    }

    await this._runComponentLifecycle(fixture, finalOptions);
    const element = this._getElement(fixture);

    return new Rendering(fixture, element, instance, finalOptions.bind, this._setup);
  }

  private _spyOnOutputs(instance: TComponent, directive: Directive) {
    if (directive.outputs) {
      directive.outputs.forEach(k => {
        const value = (instance as any)[k];
        if (value && value instanceof EventEmitter) {
          spyOn(value, 'emit').and.callThrough();
        }
      });
    }
  }

  private _bindInputsDirectlyToComponent(instance: TComponent, directive: Directive, bindings: Partial<TComponent>) {
    const inputPropertyNames = (directive.inputs || [])
      .map(k => k.split(':')[0]);
    Object.keys(bindings).forEach(k => {
      if (!inputPropertyNames.includes(k)) {
        throw new InvalidInputBindError(inputPropertyNames, k);
      }
      (instance as any)[k] = (bindings as any)[k];
    });
  }

  private async _runComponentLifecycle(fixture: ComponentFixture<any>, options: RenderOptions<any>) {
    if (options.whenStable) {
      if (options.detectChanges) {
        fixture.detectChanges();
      }
      await fixture.whenStable();
    }

    if (options.detectChanges) {
      fixture.detectChanges();
    }
  }

  private _getElement(fixture: ComponentFixture<any>) {
    return fixture.componentInstance instanceof this._setup.testComponent
      ? fixture.debugElement
      : fixture.debugElement.query(By.directive(this._setup.testComponent)) || fixture.debugElement.children[0];
  }

  private _getInstance(fixture: ComponentFixture<any>) {
    const element = this._getElement(fixture);
    const instance = element
      ? element.injector.get<TComponent>(this._setup.testComponent)
      : this._getStructuralDirectiveInstance(fixture);

    return instance;
  }

  private _getStructuralDirectiveInstance(fixture: ComponentFixture<any>) {
    const [debugNode] = fixture.debugElement.queryAllNodes(By.directive(this._setup.testComponent));
    if (debugNode) {
      return debugNode.injector.get<TComponent>(this._setup.testComponent);
    }
    throw new MissingTestComponentError(this._setup.testComponent);
  }
}
