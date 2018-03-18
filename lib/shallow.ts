import { Type } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { RenderOptions, Rendering } from './models/rendering';
import { Renderer } from './models/renderer';
import { MockCache } from './models/mock-cache';
import { TestSetup } from './models/test-setup';

export class Shallow<TTestComponent> {
  readonly setup: TestSetup<TTestComponent>;
  // Never mock the Angular Common Module, it includes things like *ngIf and basic
  // template directives.
  private static readonly _neverMock: any[] = [CommonModule, BrowserModule];
  static neverMock(...things: any[]) {
    this._neverMock.push(...things);
    return Shallow;
  }

  constructor(testComponent: Type<TTestComponent>, testModule: Type<any>) {
    this.setup = {
      testComponent,
      testModule,
      dontMock: [...Shallow._neverMock, testComponent],
      mocks: new Map<any, any>(),
      mockCache: new MockCache(),
    };
  }

  dontMock(...things: any[]) {
    this.setup.dontMock.push(...things);
    return this;
  }

  mock<TMock>(mockClass: Type<TMock>, stubs: Partial<TMock>) {
    const mock = this.setup.mocks.get(mockClass) || {};
    Object.assign(mock, stubs);
    this.setup.mocks.set(mockClass, mock);
    return this;
  }

  render<TBindings>(html?: string, renderOptions?: Partial<RenderOptions<TBindings>>): Promise<Rendering<TTestComponent, TBindings>> {
    const renderer = new Renderer(this.setup);
    return renderer.render(html, renderOptions);
  }
}
