import { Directive, EventEmitter, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { testFramework } from '../test-framework';
import { copyTestModule } from '../tools/copy-test-module';
import { createContainer } from '../tools/create-container';
import { mockProvider } from '../tools/mock-provider';
import { directiveResolver } from '../tools/reflect';
import { CustomError } from './custom-error';
import { RecursivePartial } from './recursive-partial';
import { Rendering, RenderOptions } from './rendering';
import { TestSetup } from './test-setup';

export class InvalidInputBindError extends CustomError {
  constructor(availableInputs: string[], key: string | symbol) {
    super(`Tried to bind to a property that is not marked as @Input: ${String(key)}\nAvailable input bindings: ${availableInputs}`);
  }
}

export class MissingTestComponentError extends CustomError {
  constructor(testComponent: Type<any>) {
    super(`${testComponent.name} was not found in test template`);
  }
}

export class InvalidStaticPropertyMockError extends CustomError {
  static checkMockForStaticProperties(stubs: object) {
    Object.keys(stubs).forEach(key => {
      if (typeof (stubs as any)[key] !== 'function') {
        throw new InvalidStaticPropertyMockError(key);
      }
    });
  }

  constructor(key: string | symbol) {
    super(`Tried to mock the '${String(key)}' property but only functions are supported for static mocks.`);
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
        if (!testFramework.isSpy(obj[key])) {
          testFramework.spyOn(obj, key, stub);
        } else {
          const spy = obj[key];
          testFramework.resetSpy(spy);
          testFramework.mockImplementation(spy, stub);
        }
      });
    });
  }

  private _createTemplateString(directive: Directive, bindings: any) {
    const componentInputs = (directive.inputs || [])
      .map(key => [key.replace(/:.*/, ''), key.replace(/.*: ?/, '')])
      .reduce(
        (acc, [name, renamed]) => ({...acc, [name]: renamed}),
        {} as any
      );
    const inputBindings = Object.keys(bindings).map(key => `[${componentInputs[key]}]="${key}"`).join(' ');
    return `<${directive.selector} ${inputBindings}></${directive.selector}>`;
  }

  render<TBindings extends RecursivePartial<TComponent>>(
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

    const resolvedTestComponent = directiveResolver.resolve(this._setup.testComponent);
    if (!template) {
      // If no template is used, the bindings should be verified to match the
      // component @Input properties
      this._verifyComponentBindings(resolvedTestComponent, finalOptions.bind);
    }

    const ComponentClass = createContainer(
      template || this._createTemplateString(resolvedTestComponent, finalOptions.bind),
      finalOptions.bind
    );

    // Components may have their own providers, If the test component does,
    // we will mock them out here..
    if (resolvedTestComponent.providers && resolvedTestComponent.providers.length) {
      TestBed.overrideComponent(this._setup.testComponent, {
        set: {
          providers: resolvedTestComponent.providers.map(p => mockProvider(p, this._setup))
        }
      });
    }

    const {imports, providers, declarations, schemas} = copyTestModule(this._setup);
    await TestBed.configureTestingModule({
      imports,
      providers,
      declarations: [...declarations, ComponentClass],
      schemas,
    }).compileComponents();

    const fixture = TestBed.createComponent(ComponentClass);
    const instance = this._getInstance(fixture);

    this._spyOnOutputs(instance, resolvedTestComponent);

    await this._runComponentLifecycle(fixture, finalOptions);
    const element = this._getElement(fixture);

    return new Rendering(fixture, element, instance, finalOptions.bind, this._setup);
  }

  private _spyOnOutputs(instance: TComponent, directive: Directive) {
    if (directive.outputs) {
      directive.outputs.forEach(k => {
        const value = (instance as any)[k];
        if (value && value instanceof EventEmitter) {
          testFramework.spyOn(value, 'emit');
        }
      });
    }
  }

  private _verifyComponentBindings(directive: Directive, bindings: Partial<TComponent>) {
    const inputPropertyNames = (directive.inputs || [])
      .map(k => k.split(':')[0]);
    Object.keys(bindings).forEach(k => {
      if (!inputPropertyNames.includes(k)) {
        throw new InvalidInputBindError(inputPropertyNames, k);
      }
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
