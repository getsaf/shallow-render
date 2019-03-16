import { DebugElement, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { createQueryMatch, QueryMatch } from './query-match';
import { TestSetup } from './test-setup';

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

  /////////////////////////////////////////////////////////////////////////////
  // The following methods MUST be arrow functions so they can be deconstructured
  // off of the class
  /////////////////////////////////////////////////////////////////////////////
  // TODO: Allow a second argument specifying the context of the search so we
  // don't always have to search from the top fixture.
  readonly find = (cssOrDirective: string | Type<any>) => {
    const query = typeof cssOrDirective === 'string'
      ? By.css(cssOrDirective)
      : By.directive(this._setup.mockCache.find(cssOrDirective) || cssOrDirective);
    const matches = this.fixture.debugElement.queryAll(query);

    if (matches.length && matches[0] === this.element) {
      throw new Error(`Don't use 'find' to search for your test component, it is automatically returned by the shallow renderer`);
    }

    return createQueryMatch(matches);
  }

  readonly findComponent = <TMatch>(component: Type<TMatch>): QueryMatch<TMatch> =>
    createQueryMatch(this.find(component).map(i => i.componentInstance as TMatch))

  readonly findDirective = <TDirective>(directive: Type<TDirective>): QueryMatch<TDirective> => {
    const found = this.find(directive);
    const directiveOrMock = this._setup.mockCache.find(directive) || directive;

    return createQueryMatch(found.map(i => i.injector.get<TDirective>(directiveOrMock)));
  }

  readonly get = <TClass>(queryClass: Type<TClass>): TClass => TestBed.get(queryClass);
}
