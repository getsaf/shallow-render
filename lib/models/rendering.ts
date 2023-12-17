import { DebugElement, EventEmitter, Type, InjectionToken, AbstractType } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { outputProxy, PickByType } from '../tools/output-proxy';
import { createQueryMatch, QueryMatch } from './query-match';
import { TestSetup } from './test-setup';
import { MockDirective } from '../tools/mock-directive';

export interface RenderOptions<TBindings> {
  /**
   * Toggles automatic change-detection on initial render
   *
   * @default true
   */
  detectChanges: boolean;

  /**
   * Toggles automatic awaiting of fixture.whenStable() on initial render
   *
   * @default true
   */
  whenStable: boolean;

  /**
   * Bindings to be applied to your component or HTML template `@Input` properties
   */
  bind: TBindings;
}

/**
 * Contains all information about a rendered test component including
 * utilities for querying and toggling rendered states of directives
 *
 * This is not intended for direct instantion. These are created via the `render` method on an instance of `Shallow`
 *
 * @link https://getsaf.github.io/shallow-render/#rendering
 */
export class Rendering<TComponent extends object, TBindings> {
  constructor(
    public readonly fixture: ComponentFixture<any>,
    public readonly element: DebugElement,
    public readonly instance: TComponent,
    public readonly bindings: TBindings,
    private readonly _setup: TestSetup<TComponent>,
  ) {}

  readonly outputs: PickByType<TComponent, EventEmitter<any>> = outputProxy(this.instance);

  /////////////////////////////////////////////////////////////////////////////
  // The following methods MUST be arrow functions so they can be deconstructured
  // off of the class
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Search for a component with a CSS celector
   *
   * The result is either a `DebugElement` OR an Array of `DebugElement`. Your test
   * must give proper treatment to the result based on the expected results.
   *
   * For example, if your test expects a single result, you may treat the result as a `DebugElement` or an array of `DebugElement`s with one entry.
   *
   * @example
   * expect(find('h1.large').nativeElement.textContent).toBe('Foo');
   *
   * // If your query results in multiple matches, you may iterate over the matches but if you attempt
   * // to treat the collection of matches as a single match, the test will fail due to a mismatched
   * // usage of the query results in the test.
   *
   * // This would throw an error if the query resulted in multiple matches
   * expect(find('h1.large').nativeElement.textContent).toBe('Foo');
   *
   * const results = find('h1.large');
   * expect(results.length).toBe(3);
   * expect(results.map(result => result.nativeElement.textContent)).toEqual([
   *   'Foo',
   *   'Bar',
   *   'Baz'
   * ])
   *
   * @link https://getsaf.github.io/shallow-render/#querying
   */
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

  /**
   * Search for a component by it's class
   *
   * The result is either an instance of the component OR an Array of component instances. Your test
   * must give proper treatment to the result based on the expected results.
   *
   * For example, if your test expects a single result, you may treat the result as a single component instance or an array of instances with one entry.
   *
   * @example
   * expect(find(ItemComponent).label).toBe('Foo');
   *
   * // If your query results in multiple matches, you may iterate over the matches but if you attempt
   * // to treat the collection of matches as a single match, the test will fail due to a mismatched
   * // usage of the query results in the test.
   *
   * // This would throw an error if the query resulted in multiple matches
   * expect(findComponent(ItemComponent).label).toBe('Foo');
   *
   * const results = findComponent(ItemComponent);
   * expect(results.length).toBe(3);
   * expect(results.map(result => result.label)).toEqual([
   *   'Foo',
   *   'Bar',
   *   'Baz'
   * ])
   *
   * @link https://getsaf.github.io/shallow-render/#querying
   */
  readonly findComponent = <TMatch>(component: Type<TMatch>, options?: { query?: string }): QueryMatch<TMatch> =>
    this.findDirective(component, options);

  /**
   * Search for a directive by it's class
   *
   * Note: For structural directives, @see Rendering#findStructuralDirective
   *
   * The result is either an instance of the directive OR an Array of directive instances. Your test
   * must give proper treatment to the result based on the expected results.
   *
   * For example, if your test expects a single result, you may treat the result as a single directive instance or an array of instances with one entry.
   *
   * @example
   * expect(findDirective(MyDirective).label).toBe('Foo');
   *
   * // If your query results in multiple matches, you may iterate over the matches but if you attempt
   * // to treat the collection of matches as a single match, the test will fail due to a mismatched
   * // usage of the query results in the test.
   *
   * // This would throw an error if the query resulted in multiple matches
   * expect(findDirective(MyDirective).label).toBe('Foo');
   *
   * const results = findDirective(MyDirective);
   * expect(results.length).toBe(3);
   * expect(results.map(result => result.label)).toEqual([
   *   'Foo',
   *   'Bar',
   *   'Baz'
   * ])
   *
   * @link https://getsaf.github.io/shallow-render/#querying
   */
  readonly findDirective = <TDirective>(
    directive: Type<TDirective>,
    options?: { query?: string },
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

  /**
   * Get the instance of a provider via Angular's injection system.
   *
   * This is identical to `TestBed.inject`
   */
  readonly inject = TestBed.inject.bind(TestBed);

  /**
   * Search for a structural directive by it's class
   *
   * The result is either an instance of the directive OR an Array of directive instances. Your test
   * must give proper treatment to the result based on the expected results.
   *
   * For example, if your test expects a single result, you may treat the result as a single directive instance or an array of directives with one entry.
   *
   * @example
   * expect(find(MyDirective).label).toBe('Foo');
   *
   * // If your query results in multiple matches, you may iterate over the matches but if you attempt
   * // to treat the collection of matches as a single match, the test will fail due to a mismatched
   * // usage of the query results in the test.
   *
   * // This would throw an error if the query resulted in multiple matches
   * expect(findStructuralDirective(MyDirective).label).toBe('Foo');
   *
   * const results = findStructuralDirective(MyDirective);
   * expect(results.length).toBe(3);
   * expect(results.map(result => result.label)).toEqual([
   *   'Foo',
   *   'Bar',
   *   'Baz'
   * ])
   *
   * @link https://getsaf.github.io/shallow-render/#querying
   */
  readonly findStructuralDirective = <TDirective>(
    directiveClass: Type<TDirective>,
    options?: { query?(d: TDirective): boolean },
  ) =>
    createQueryMatch(
      this.fixture.debugElement
        .queryAllNodes(node => {
          try {
            const instance = node.injector.get(directiveClass);
            if (instance) {
              return options && options.query ? options.query(instance) : true;
            }
          } catch (e) {}
          return false;
        })
        .map(node => node.injector.get<TDirective>(directiveClass)),
    );

  /**
   * Toggle on and off the rendering of child templates into a structural directive
   *
   * @link https://getsaf.github.io/shallow-render/#structural-directives
   */
  readonly renderStructuralDirective = (
    directiveClassOrObject: Type<any> | QueryMatch<any> | object,
    renderContents = true,
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
          `You may only manually render mocked directives with "renderStructuralDirective". Tried to render a structural directive (${directiveName}) but the directive is not mocked.`,
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
