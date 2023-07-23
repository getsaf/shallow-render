import { Directive, forwardRef, Type, Optional, ViewContainerRef, TemplateRef, OnInit, Inject } from '@angular/core';
import { reflect } from './reflect';
import { MockOf } from './mock-of.directive';
import { TestBed } from '@angular/core/testing';
import { mockWithInputsOutputsAndStubs } from './mock-with-inputs-and-outputs-and-stubs';
import { NG_VALUE_ACCESSOR, DefaultValueAccessor } from '@angular/forms';

export type MockDirective = {
  renderContents: () => void;
  clearContents: () => void;
};

export function mockDirective<TDirective extends Type<any>>(
  directive: TDirective,
  config?: { stubs?: object; renderContentsOnInit?: boolean },
): TDirective {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const { selector, exportAs, standalone } = reflect.resolveDirective(directive);
  @MockOf(directive)
  @Directive({
    selector: selector || `__${directive.name}-selector`,
    providers: [
      { provide: directive, useExisting: forwardRef(() => MockDirective) },
      { provide: NG_VALUE_ACCESSOR, useClass: DefaultValueAccessor, multi: true },
    ],
    exportAs,
    standalone,
  })
  class MockDirective extends mockWithInputsOutputsAndStubs(directive, config?.stubs) implements OnInit {
    constructor(
      @Inject(ViewContainerRef) @Optional() private _viewContainer: ViewContainerRef,
      @Inject(TemplateRef<any>) @Optional() private _template?: TemplateRef<any>,
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
  TestBed.overrideDirective(MockDirective, {
    add: { providers: [{ provide: directive, useExisting: forwardRef(() => MockDirective) }] },
  });

  return MockDirective as any;
}
