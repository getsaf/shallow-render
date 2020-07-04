import { DebugElement, EventEmitter, Type, InjectionToken, AbstractType } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { outputProxy, PickByType } from '../tools/output-proxy';
import { createQueryMatch, QueryMatch } from './query-match';
import { TestSetup } from './test-setup';
import { MockDirective } from '../tools/mock-directive';

export interface RenderOptions<TBindings> {
  detectChanges: boolean;
  whenStable: boolean;
  bind: TBindings;
}

export class Rendering<TComponent, TBindings> {
  constructor(
    public readonly fixture: ComponentFixture<any>,
    public readonly element: DebugElement,
    public readonly instance: TComponent,
    public readonly bindings: TBindings,
    private readonly _setup: TestSetup<TComponent>
  ) {}

  readonly outputs: PickByType<TComponent, EventEmitter<any>> = outputProxy(this.instance);

  /////////////////////////////////////////////////////////////////////////////
  // The following methods MUST be arrow functions so they can be deconstructured
  // off of the class
  /////////////////////////////////////////////////////////////////////////////
  readonly find = (cssOrDirective: string | Type<any>, options?: { query?: string }): QueryMatch<DebugElement> => {
    const query =
      typeof cssOrDirective === 'string'
        ? By.css(cssOrDirective)
        : By.directive(this._setup.mockCache.find(cssOrDirective) || cssOrDirective);
    const mainQuery = this.fixture.debugElement.queryAll(query);
    const found =
      options && options.query
        ? this.fixture.debugElement.queryAll(By.css(options.query)).filter(item => mainQuery.includes(item))
        : mainQuery;

    if (found.includes(this.element)) {
      throw new Error(`Don't search for your test component, it is automatically returned by the shallow renderer`);
    }

    return createQueryMatch(found);
  };

  readonly findComponent = <TMatch>(component: Type<TMatch>, options?: { query?: string }): QueryMatch<TMatch> =>
    this.findDirective(component, options);

  readonly findDirective = <TDirective>(
    directive: Type<TDirective>,
    options?: { query?: string }
  ): QueryMatch<TDirective> => {
    const directiveOrMock = this._setup.mockCache.find(directive) || directive;
    const foundElements =
      options && options.query
        ? this.fixture.debugElement.queryAll(By.css(options.query))
        : this.find(directive, options);
    const foundDirectives = foundElements
      .map(result => {
        try {
          return result.injector.get<TDirective>(directiveOrMock);
        } catch (e) {
          return undefined;
        }
      })
      .filter(i => i) as TDirective[];
    if (foundDirectives.some(i => (i as any) === this.instance)) {
      throw new Error(`Don't search for your test component, it is automatically returned by the shallow renderer`);
    }
    return createQueryMatch(foundDirectives);
  };

  /**
   * @deprecated Use inject instead
   */
  readonly get = <TValue>(queryClass: Type<TValue> | InjectionToken<TValue> | AbstractType<TValue>): TValue =>
    TestBed.inject(queryClass);

  // tslint:disable-next-line: member-ordering
  readonly inject = TestBed.inject.bind(TestBed);

  readonly findStructuralDirective = <TDirective>(
    directiveClass: Type<TDirective>,
    options?: { query?(d: TDirective): boolean }
  ) =>
    createQueryMatch(
      this.fixture.debugElement
        .queryAllNodes(node => {
          try {
            const instance = node.injector.get(directiveClass);
            if (instance) {
              return options && options.query ? options.query(instance) : true;
            }
          } catch (e) {} // tslint:disable-line no-empty
          return false;
        })
        .map(node => node.injector.get<TDirective>(directiveClass))
    );

  readonly renderStructuralDirective = (
    directiveClassOrObject: Type<any> | QueryMatch<any> | object,
    renderContents = true
  ) => {
    const directives: Array<MockDirective> =
      typeof directiveClassOrObject === 'function'
        ? this.findStructuralDirective<MockDirective>(directiveClassOrObject)
        : directiveClassOrObject.length
        ? directiveClassOrObject
        : [directiveClassOrObject];

    if (!directives.length) {
      throw new Error(`Tried to render a structural directive but none were found.`);
    }

    directives.forEach(foundDirective => {
      if (!('renderContents' in foundDirective)) {
        const directiveName = Object.getPrototypeOf(foundDirective).constructor.name;
        throw new Error(
          `You may only manually render mocked directives with "renderStructuralDirective". Tried to render a structural directive (${directiveName}) but the directive is not mocked.`
        );
      }
      if (renderContents) {
        foundDirective.renderContents();
      } else {
        foundDirective.clearContents();
      }
    });
  };
}
