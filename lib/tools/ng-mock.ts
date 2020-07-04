import { PipeTransform, Type } from '@angular/core';
import { AngularModule } from '../models/angular-module';
import { TestSetup } from '../models/test-setup';
import { mockModule } from './mock-module';
import { directiveResolver, ngModuleResolver } from './reflect';
import { isModuleWithProviders, isPipeTransform, isClass, declarationType } from './type-checkers';
import { CustomError } from '../models/custom-error';
import { mockPipe } from './mock-pipe';
import { mockDirective } from './mock-directive';
import { mockComponent } from './mock-component';
import { TestBed } from '@angular/core/testing';

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
      mock = mockPipe(thing, setup.mockPipes.get(thing));
    } else if (isClass(thing)) {
      const stubs = setup.mocks.get(thing);
      mock =
        declarationType(thing) === 'Component'
          ? mockComponent(thing, { stubs })
          : mockDirective(thing, {
              stubs,
              renderContentsOnInit:
                setup.withStructuralDirectives.get(thing) ||
                (setup.alwaysRenderStructuralDirectives && setup.withStructuralDirectives.get(thing) !== false),
            });
      fixEmptySelector(thing, mock);
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
      `Shallow ran into some trouble mocking ${
        thing?.name || thing
      }. Try skipping it with dontMock or neverMock.\n------------- MOCK ERROR -------------\n${
        error?.stack || error
      }\n----------- END MOCK ERROR -----------`
    );
  }
}

const fixEmptySelector = (thing: Type<any>, mock: Type<any>) => {
  const { selector } = directiveResolver.resolve(thing);
  if (!selector) {
    TestBed.overrideDirective(mock, { add: { selector: `.__${mock.name}-selector` } });
  }
};
