import { MockDeclaration, MockPipe } from 'ng-mocks';
import { mockModule } from './mock-module';
import { TestSetup } from '../models/test-setup';
import { ngModuleResolver } from './reflect';
import { isModuleWithProviders, isPipeTransform } from './type-checkers';
import { ModuleWithProviders, Type, PipeTransform } from '@angular/core';

export type NgMockable = ModuleWithProviders | Type<any> | Type<PipeTransform> | any[];

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
    } else {
      throw new Error(`Shallow doesn't know how to mock: ${thing}`);
    }
  } catch (e) {
    throw new Error(`Shallow ran into some trouble mocking ${(thing as any).name || thing}. Try skipping it with dontMock or neverMock.\n${e}`);
  }
  return setup.mockCache.add(thing, mock) as TThing;
}
