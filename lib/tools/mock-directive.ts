import { Directive, forwardRef, Type, Optional, ViewContainerRef, TemplateRef, OnInit, Provider } from '@angular/core';
import { directiveResolver } from './reflect';
import { MockOf } from './mock-of.directive';
import { TestBed } from '@angular/core/testing';
import { mockWithInputsOutputsAndStubs } from './mock-base';

export type MockDirective = {
  renderContents: () => void;
  clearContents: () => void;
};

export function mockDirective<TDirective extends Type<any>>(
  directive: TDirective,
  config?: { stubs?: object; renderContentsOnInit?: boolean; providerTransform?: (providers: Provider[]) => Provider[] }
): TDirective {
  const { selector, exportAs, providers = [] } = directiveResolver.resolve(directive);
  const providerTransform = (config && config.providerTransform) || (() => []);

  @MockOf(directive)
  @Directive({
    selector: selector || `__${directive.name}-selector`,
    providers: [{ provide: directive, useExisting: forwardRef(() => Mock) }, ...providerTransform(providers)],
    exportAs,
  })
  class Mock extends mockWithInputsOutputsAndStubs(directive, config?.stubs) implements OnInit, MockDirective {
    constructor(
      @Optional() private _viewContainer?: ViewContainerRef,
      @Optional() private _template?: TemplateRef<any>
    ) {
      super();
    }

    public ngOnInit() {
      if (config?.renderContentsOnInit) {
        this.renderContents();
      }
    }

    public renderContents() {
      if (this._viewContainer && this._template) {
        this._viewContainer.clear();
        this._viewContainer.createEmbeddedView(this._template);
      }
    }

    public clearContents() {
      this._viewContainer?.clear();
    }
  }

  // Provide our mock in place of any other usage of 'thing'.
  // This makes `ViewChild` and `ContentChildren` selectors work!
  TestBed.overrideDirective(Mock, {
    add: { providers: [{ provide: directive, useExisting: forwardRef(() => Mock) }] },
  });

  return Mock as any;
}
