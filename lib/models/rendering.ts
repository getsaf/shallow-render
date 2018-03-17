import { DebugElement, Type } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MockCache } from './mock-cache';
import { EmptyQueryMatch, QueryMatch, QueryMatchClass } from './query-match';

export interface RenderOptions<TBindings> {
  detectChanges: boolean;
  bind: TBindings;
}

export class Rendering<TComponent, TBindings> {
  readonly mockCache = new MockCache();
  readonly element: DebugElement;
  readonly instance: TComponent;

  constructor(
    private _testComponentClass: Type<TComponent>,
    public fixture: ComponentFixture<any>,
    private _mockCache: MockCache,
    public bindings: TBindings
  ) {
    this.element = this.fixture.componentInstance instanceof this._testComponentClass
      ? this.fixture.debugElement.query(By.directive(this._testComponentClass))
      : this.fixture.debugElement;

    if (!this.element) {
      throw new Error(`${this._testComponentClass.name} was not found in test template`);
    }
    this.instance = this.element.injector.get(this._testComponentClass);
  }

  /////////////////////////////////////////////////////////////////////////////
  // The following methods MUST be arrow functions so they can be destructured
  // off of the class
  /////////////////////////////////////////////////////////////////////////////
  //
  readonly find = (cssOrDirective: string | Type<any>) => {
    if (cssOrDirective === this._testComponentClass) {
      throw new Error(`Don't use 'find' to search for your test component, it is automatically returned by the shallow renderer`);
    }
    const query = typeof cssOrDirective === 'string'
      ? By.css(cssOrDirective)
      : By.directive(this._mockCache.find(cssOrDirective));
    const matches = this.element.queryAll(query);
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
    return found.injector.get<TDirective>(this._mockCache.find(directive));
  }

  readonly get = <TClass>(queryClass: Type<TClass>): TClass => TestBed.get(queryClass);
}
