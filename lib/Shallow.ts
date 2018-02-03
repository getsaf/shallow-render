import { NgModule, Component, Type, DebugElement } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
export type __junkType = DebugElement | ComponentFixture<any>; // To satisfy a TS build bug

export class ShallowContainer {}

export interface RenderOptions {
  skipDetectChanges: boolean;
  mockEverything: boolean;
}

export class Shallow<T> {
  private readonly _moduleProps = this._copyModule();
  constructor(private readonly _testComponentClass: Type<T>, private readonly _fromModuleClass: Type<any>) {}

  private _copyModule(): NgModule {
    const moduleProps = ((this._fromModuleClass as any).__annotations__[0]) as NgModule;
    if (moduleProps.declarations) {
      moduleProps.declarations = moduleProps.declarations.filter(i => this._testComponentClass);
    }
    if (moduleProps.exports) {
      moduleProps.exports = moduleProps.exports.filter(i => this._testComponentClass);
    }
    return moduleProps;
  }

  async render(html: string, renderOptions?: Partial<RenderOptions>) {
    const options: RenderOptions = {
      skipDetectChanges: false,
      mockEverything: true,
      ...renderOptions,
    };

    @Component({
      selector: 'shallow-container',
      template: html,
    })
    class ProxyShallowContainer extends ShallowContainer {}

    await TestBed.configureTestingModule({
      imports: this._moduleProps.imports,
      providers: this._moduleProps.providers,
      declarations: [...this._moduleProps.declarations as any[], ProxyShallowContainer],
    }).compileComponents();

    const fixture = TestBed.createComponent(ProxyShallowContainer) as ComponentFixture<ShallowContainer>;

    const find = (cssOrDirective: string | Type<any>) => {
      const query = typeof cssOrDirective === 'string'
        ? By.css(cssOrDirective)
        : By.directive(cssOrDirective);
      return fixture.debugElement.query(query);
    };

    const element = find(this._testComponentClass);
    const instance = element.injector.get(this._testComponentClass);

    if (!options.skipDetectChanges) {
      fixture.detectChanges();
    }

    return {
      TestBed,
      fixture,
      element,
      find,
      instance,
    };
  }
}
