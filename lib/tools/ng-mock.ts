import { forwardRef, PipeTransform, Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MockDeclaration, MockPipe } from 'ng-mocks';
import { AngularModule } from '../models/angular-module';
import { TestSetup } from '../models/test-setup';
import { testFramework } from '../test-frameworks/test-framework';
import { mockModule } from './mock-module';
import { directiveResolver, ngModuleResolver } from './reflect';
import { isModuleWithProviders, isPipeTransform, isClass } from './type-checkers';
import { CustomError } from '../models/custom-error';

export type NgMockable = AngularModule | Type<any> | Type<PipeTransform> | any[];

export function ngMock<TThing extends NgMockable | NgMockable[]>(thing: TThing, setup: TestSetup<any>): TThing {
  const cached = setup.mockCache.find(thing);

  if (cached) {
    return cached;
  }

  if (Array.isArray(thing)) {
    return setup.mockCache.add(thing, thing.map(t => ngMock(t, setup)) as TThing); // Recursion
  }

  if (setup.dontMock.includes(thing) || (isModuleWithProviders(thing) && setup.dontMock.includes(thing.ngModule))) {
    return thing;
  }

  let mock: NgMockable;
  try {
    if (ngModuleResolver.isNgModule(thing) || isModuleWithProviders(thing)) {
      mock = mockModule(thing, setup);
    } else if (isPipeTransform(thing)) {
      mock = MockPipe(thing, setup.mockPipes.get(thing));
    } else if (isClass(thing)) {
      mock = MockDeclaration(thing);
      fixEmptySelector(thing, mock);
      if (shouldRenderOnInit(setup, thing)) {
        renderTemplateOnInit(mock);
      }
      const stubs = setup.mocks.get(thing);
      if (stubs) {
        mock = extendMockWithStubs(mock, stubs, `MockOf${thing.name}`);
      }
      // Provide our mock in place of any other usage of 'thing'.
      // This makes `ViewChild` and `ContentChildren` selectors work!
      TestBed[isComponent(mock) ? 'overrideComponent' : 'overrideDirective'](mock, {
        add: { providers: [{ provide: thing, useExisting: forwardRef(() => mock) }] }
      });
    } else {
      throw new DoNotKnowHowToMockError(thing);
    }
  } catch (e) {
    throw new MockError(thing, e);
  }
  return setup.mockCache.add(thing, mock) as TThing;
}

class DoNotKnowHowToMockError extends CustomError {
  constructor(thing: any) {
    super(`Shallow doesn't know how to mock: ${thing}`);
  }
}

class MockError extends CustomError {
  constructor(thing: any, error: any) {
    super(
      `Shallow ran into some trouble mocking ${thing?.name ||
        thing}. Try skipping it with dontMock or neverMock.\n------------- MOCK ERROR -------------\n${error?.stack ||
        error}\n----------- END MOCK ERROR -----------`
    );
  }
}

const extendMockWithStubs = (mock: Type<any>, stubs: object, className: string): Type<any> => {
  class WithStubs extends createExtendableNgMockClass(mock) {
    constructor() {
      super();
      Object.assign(this, stubs);
      Object.keys(stubs).forEach(key => {
        if (typeof this[key] === 'function') {
          testFramework.spyOn(this, key);
        }
      });
    }
  }
  Object.defineProperty(WithStubs, 'name', { value: className });
  return WithStubs;
};

const createExtendableNgMockClass = (from: Type<any>): Type<any> => {
  // For some reason I cannot directly extend classes from ng-mocks?
  // tslint:disable-next-line: only-arrow-functions
  const ExtendableMock = function(...args: any) {
    const thing = new (from as any)(...args);
    return thing;
  };
  ExtendableMock.prototype = from.prototype;
  return ExtendableMock as any;
};

const shouldRenderOnInit = (setup: TestSetup<any>, thing: any) =>
  setup.withStructuralDirectives.get(thing as Type<any>) ||
  (setup.alwaysRenderStructuralDirectives && setup.withStructuralDirectives.get(thing as Type<any>) !== false);

const isComponent = (thing: Type<any>) => {
  if (directiveResolver.isDirective(thing)) {
    const metadata = directiveResolver.resolve(thing);
    return 'template' in metadata || 'templateUrl' in metadata;
  }
  return false;
};

const fixEmptySelector = (thing: Type<any>, mock: Type<any>) => {
  const annotations = directiveResolver.resolve(thing);
  if (!annotations.selector) {
    TestBed.overrideDirective(mock, { add: { selector: `.__${mock.name}-selector` } });
  }
  return thing;
};

const renderTemplateOnInit = (mock: Type<any>) => {
  const originalInit = (mock.prototype.ngOnInit = mock.prototype.ngOnInit ?? (() => {}));
  testFramework.spyOn(mock.prototype, 'ngOnInit', function() {
    try {
      // @ts-ignore
      originalInit.call(this);
      // @ts-ignore
      this.__render();
    } catch (e) {}
  });
};
