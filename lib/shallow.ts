import { Provider, Type } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { RenderOptions, Rendering } from './models/rendering';
import { Renderer } from './models/renderer';

export class Shallow<TTestComponent> {
  // Never mock the Angular Common Module, it includes things like *ngIf and basic
  // template directives.
  private static readonly _neverMock: any[] = [CommonModule, BrowserModule];
  static neverMock(...things: any[]) {
    this._neverMock.push(...things);
    return Shallow;
  }

  constructor(public readonly testComponentClass: Type<TTestComponent>, private readonly _fromModuleClass: Type<any>) {}

  private readonly _dontMock: any[] = [];
  dontMock(...things: any[]) {
    this._dontMock.push(...things);
    return this;
  }

  private get _allUnmocked(): Type<any>[] { return [this.testComponentClass, ...Shallow._neverMock, ...this._dontMock]; }

  private _shouldMock(thing: any) {
    return !this._allUnmocked.includes(thing);
  }

  private _mocks = new Map<any, any>();
  mock<TMock>(mockClass: Type<TMock>, stubs: Partial<TMock>) {
    const mock = this._mocks.get(mockClass) || {class: mockClass, stubs: {}};
    Object.assign(mock.stubs, stubs);
    this._mocks.set(mockClass, mock);
    return this;
  }


  render<TBindings>(html?: string, renderOptions?: Partial<RenderOptions<TBindings>>): Promise<Rendering<TTestComponent, TBindings>> {
    const renderer = new Renderer(this.testComponentClass, this._fromModuleClass, this._allUnmocked);
    return renderer.render(html, renderOptions);
  }
}
