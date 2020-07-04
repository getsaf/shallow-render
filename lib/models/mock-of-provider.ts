import { Type } from '@angular/core';
import { MockOf } from '../tools/mock-of.directive';
import { MockWithStubs } from './mock-with-stubs';

export class MockOfProvider extends MockWithStubs {}

export const mockProviderClass = <TProvider extends Type<any>>(provider: TProvider, stubs: any): TProvider => {
  @MockOf(provider)
  class MockProvider extends MockOfProvider {
    constructor() {
      super(stubs);
    }
  }
  return MockProvider as TProvider;
};
