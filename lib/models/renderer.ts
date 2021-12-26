import { Directive, EventEmitter, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { testFramework } from '../test-frameworks/test-framework';
import { createContainer } from '../tools/create-container';
import { createTestModule } from '../tools/create-test-module';
import { mockProvider } from '../tools/mock-provider';
import { reflect } from '../tools/reflect';
import { CustomError } from './custom-error';
import { RecursivePartial } from './recursive-partial';
import { Rendering, RenderOptions } from './rendering';
import { TestSetup } from './test-setup';
import { mockStatics } from '../tools/mock-statics';
import { injectRootProviders } from '../tools/inject-root-providers';

export class InvalidInputBindError extends CustomError {
  constructor(availableInputs: string[], key: string | symbol) {
    super(
      `Tried to bind to a property that is not marked as @Input: ${String(
        key
      )}\nAvailable input bindings: ${availableInputs}`
    );
  }
}

export class InvalidBindOnEntryComponentError extends CustomError {
  constructor(component: Type<any>) {
    super(
      `Tried to bind @Inputs to component that has no selector (${component.name}). EntryComponents cannot have template-bound inputs.\nIf you need to set properties on an EntryComponent, you must set them on the \`instance\`.\nIf this is not meant to be an EntryComoponent, please add a selector in th component definition.\n\nFor more details see the docs:\nhttps://github.com/getsaf/shallow-render/wiki/FAQ#bindings-on-entrycomponents`
    );
  }
}

export class MissingTestComponentError extends CustomError {
  constructor(testComponent: Type<any>) {
    super(`${testComponent.name} was not found in test template`);
  }
}

export class Renderer<TComponent> {
  constructor(private readonly _setup: TestSetup<TComponent>) {}

  private _createTemplateString(directive: Directive, bindings: any) {
    const componentInputs = reflect
      .getInputsAndOutputs(this._setup.testComponentOrService)
      .inputs.reduce<Record<string, string>>(
        (acc, input) => ({
          ...acc,
          [input.propertyName]: input.alias || input.propertyName,
        }),
        {}
      );
    const inputBindings = Object.keys(bindings)
      .map(key => `[${componentInputs[key]}]="${key}"`)
      .join(' ');
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
    const [template, options] =
      typeof templateOrOptions === 'string' ? [templateOrOptions, optionsOrUndefined] : [undefined, templateOrOptions];

    const finalOptions: RenderOptions<TBindings> = {
      detectChanges: true,
      whenStable: true,
      bind: {} as TBindings,
      ...options,
    };

    mockStatics(this._setup);
    injectRootProviders(this._setup);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const resolvedTestComponent = reflect.resolveDirective(this._setup.testComponentOrService)!;
    if (!template) {
      // If no template is used, the bindings should be verified to match the
      // component @Input properties
      this._verifyComponentBindings(resolvedTestComponent, finalOptions.bind);
    }

    const ComponentClass = resolvedTestComponent.selector
      ? createContainer(
          template || this._createTemplateString(resolvedTestComponent, finalOptions.bind),
          finalOptions.bind
        )
      : this._setup.testComponentOrService;

    // Components may have their own providers, If the test component does,
    // we will mock them out here..
    if (resolvedTestComponent.providers && resolvedTestComponent.providers.length) {
      TestBed.overrideComponent(this._setup.testComponentOrService, {
        set: {
          providers: resolvedTestComponent.providers.map(p => mockProvider(p, this._setup)),
        },
      });
    }

    await TestBed.configureTestingModule({
      imports: [createTestModule(this._setup, [this._setup.testComponentOrService, ComponentClass])],
    }).compileComponents();

    const fixture = TestBed.createComponent(ComponentClass);
    const instance = this._getInstance(fixture);

    this._spyOnOutputs(instance);

    await this._runComponentLifecycle(fixture, finalOptions);
    const element = this._getElement(fixture);

    return new Rendering(fixture, element, instance, finalOptions.bind, this._setup);
  }

  private _spyOnOutputs(instance: TComponent) {
    const outputs = reflect.getInputsAndOutputs(this._setup.testComponentOrService).outputs;
    outputs.forEach(({ propertyName }) => {
      const value = (instance as any)[propertyName];
      if (value && value instanceof EventEmitter) {
        testFramework.spyOn(value, 'emit');
      }
    });
  }

  private _verifyComponentBindings(directive: Directive, bindings: Partial<TComponent>) {
    if (!directive.selector && Object.keys(bindings).length) {
      throw new InvalidBindOnEntryComponentError(this._setup.testComponentOrService);
    }

    const inputPropertyNames = reflect
      .getInputsAndOutputs(this._setup.testComponentOrService)
      .inputs.map(i => i.propertyName);
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
    return fixture.componentInstance instanceof this._setup.testComponentOrService
      ? fixture.debugElement
      : fixture.debugElement.query(By.directive(this._setup.testComponentOrService)) ||
          fixture.debugElement.children[0];
  }

  private _getInstance(fixture: ComponentFixture<any>) {
    const element = this._getElement(fixture);
    const instance = element
      ? element.injector.get<TComponent>(this._setup.testComponentOrService)
      : this._getStructuralDirectiveInstance(fixture);

    return instance;
  }

  private _getStructuralDirectiveInstance(fixture: ComponentFixture<any>) {
    const [debugNode] = fixture.debugElement.queryAllNodes(By.directive(this._setup.testComponentOrService));
    if (debugNode) {
      return debugNode.injector.get<TComponent>(this._setup.testComponentOrService);
    }
    throw new MissingTestComponentError(this._setup.testComponentOrService);
  }
}
