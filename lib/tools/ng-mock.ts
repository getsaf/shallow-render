import { TestBed } from '@angular/core/testing';
import { MockDeclaration, MockPipe } from 'ng-mocks';
import { mockModule } from './mock-module';
import { TestSetup } from '../models/test-setup';
import { ngModuleResolver, directiveResolver } from './reflect';
import { isModuleWithProviders, isPipeTransform } from './type-checkers';
import { Type, PipeTransform, forwardRef } from '@angular/core';
import { AngularModule } from '../models/angular-module';

export type NgMockable = AngularModule | Type<any> | Type<PipeTransform> | any[];

const fixEmptySelector = (thing: Type<any>, mock: Type<any>) => {
  const annotations = directiveResolver.resolve(thing);
  if (!annotations.selector) {
    TestBed.overrideDirective(mock, { add: { selector: `__${mock.name}-selector` } });
  }
};

export function ngMock<TThing extends NgMockable | NgMockable[]>(thing: TThing, setup: TestSetup<any>): TThing {
  const cached = setup.mockCache.find(thing);

  if (cached) {
    return cached;
  }

  if (Array.isArray(thing)) {
    // tslint:disable-next-line no-unnecessary-type-assertion
    return setup.mockCache.add(thing, thing.map(t => ngMock(t, setup))) as any; // Recursion
  }

  if (setup.dontMock.includes(thing)) {
    return thing;
  }

  let mock: NgMockable;
  try {
    if (ngModuleResolver.isNgModule(thing) || isModuleWithProviders(thing)) {
      mock = mockModule(thing, setup);
    } else if (isPipeTransform(thing)) {
      mock = MockPipe(thing as Type<any>, setup.mockPipes.get(thing));
    } else if (typeof thing === 'function') {
      mock = MockDeclaration(thing as Type<any>);
      fixEmptySelector(thing as Type<any>, mock);
      const stubs = setup.mocks.get(thing);
      if (stubs) {
        mock = class extends (mock as Type<any>) {
          constructor() {
            super();
            Object.assign(this, stubs);
            Object.keys(stubs).forEach(key => {
              if (typeof this[key] === 'function') {
                spyOn(this, key).and.callThrough();
              }
            });
          }
        };
        Object.defineProperty(mock, 'name', {value: `MockOf${(thing as Type<any>).name}`});
      }
      // Provide our mock in place of any other usage of 'thing'.
      // This makes `ViewChild` and `ContentChildren` selectors work!
      TestBed.overrideComponent(mock, {add: {providers: [{provide: thing, useExisting: forwardRef(() => mock)}]}});
    } else {
      throw new Error(`Shallow doesn't know how to mock: ${thing}`);
    }
  } catch (e) {
    throw new Error(`Shallow ran into some trouble mocking ${(thing as any).name || thing}. Try skipping it with dontMock or neverMock.\n------------- MOCK ERROR -------------\n${e && e.stack || e}\n----------- END MOCK ERROR -----------`);
  }
  return setup.mockCache.add(thing, mock) as TThing;
}
