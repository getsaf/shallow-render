import { DebugElement, Type } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { EmptyQueryMatch, QueryMatch, QueryMatchClass } from './query-match';
import { TestSetup } from './test-setup';

export interface RenderOptions<TBindings> {
  detectChanges: boolean;
  bind: TBindings;
}

export class Rendering<TComponent, TBindings> {
  readonly element: DebugElement;
  readonly instance: TComponent;

  constructor(public fixture: ComponentFixture<any>, public bindings: TBindings, private readonly _setup: TestSetup<TComponent>) {
    this.element = this.fixture.componentInstance instanceof this._setup.testComponent
      ? this.fixture.debugElement
      : this.fixture.debugElement.query(By.directive(this._setup.testComponent));

    if (!this.element) {
      throw new Error(`${this._setup.testComponent.name} was not found in test template`);
    }

    this.instance = this.element.injector.get<TComponent>(this._setup.testComponent);
  }

  /////////////////////////////////////////////////////////////////////////////
  // The following methods MUST be arrow functions so they can be deconstructured
  // off of the class
  /////////////////////////////////////////////////////////////////////////////
  readonly find = (cssOrDirective: string | Type<any>) => {
    const query = typeof cssOrDirective === 'string'
      ? By.css(cssOrDirective)
      : By.directive(this._setup.mockCache.find(cssOrDirective) || cssOrDirective);
    const matches = this.fixture.debugElement.queryAll(query);

    if (matches.length && matches[0] === this.element) {
      throw new Error(`Don't use 'find' to search for your test component, it is automatically returned by the shallow renderer`);
    }

    if (matches.length === 0) {
      return (new EmptyQueryMatch() as any) as QueryMatch;
    }
    return QueryMatchClass.fromMatches(matches);
  }

  readonly findDirective = <TDirective>(directive: Type<TDirective>): TDirective | undefined => {
    const found = this.find(directive);
    if (found.length === 0) {
      return undefined;
    }

    if (found.componentInstance && found.componentInstance instanceof directive) {
      return found.componentInstance;
    }

    return found.injector.get<TDirective>(this._setup.mockCache.find(directive) || directive);
  }

  readonly get = <TClass>(queryClass: Type<TClass>): TClass => TestBed.get(queryClass);
}
