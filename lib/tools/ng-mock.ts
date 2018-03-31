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
  if (ngModuleResolver.isNgModule(thing) || isModuleWithProviders(thing)) {
    mock = mockModule(thing, setup);
  } else if (isPipeTransform(thing)) {
      mock = MockPipe(thing as any, setup.mockPipes.get(thing)); // Use any because ng-mocks has an unusable input type
  } else if (typeof thing === 'function') {
    mock = MockDeclaration(thing as any); // Use any because ng-mocks has an unusable input type
  } else {
    throw new Error(`Don't know how to mock: ${thing}`);
  }
  return setup.mockCache.add(thing, mock) as TThing;
}
