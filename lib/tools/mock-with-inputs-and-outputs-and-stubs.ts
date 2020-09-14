import { Input, Output, EventEmitter, Type } from '@angular/core';
import { directiveResolver } from './reflect';
import { MockWithStubs } from '../models/mock-with-stubs';

export const mockWithInputsOutputsAndStubs = (componentOrDirective: Type<any>, stubs?: object): Type<any> => {
  const { inputs, outputs } = directiveResolver.resolve(componentOrDirective);

  class Mock extends MockWithStubs {
    constructor() {
      super(stubs);
      outputs?.map(output => output.split(': ')).forEach(([key]) => Object.assign(this, { [key]: new EventEmitter() }));
    }
  }
  inputs?.map(input => input.split(': ')).forEach(([key, alias]) => Input(alias)(Mock.prototype, key));
  outputs?.map(output => output.split(': ')).forEach(([key, alias]) => Output(alias)(Mock.prototype, key));

  return Mock;
};
