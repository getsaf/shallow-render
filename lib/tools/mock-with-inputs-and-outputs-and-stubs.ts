import { Input, Output, EventEmitter, Type } from '@angular/core';
import { reflect } from './reflect';
import { MockWithStubs } from '../models/mock-with-stubs';

export const mockWithInputsOutputsAndStubs = (componentOrDirective: Type<any>, stubs?: object): Type<any> => {
  const { inputs, outputs } = reflect.getInputsAndOutputs(componentOrDirective);

  class Mock extends MockWithStubs {
    constructor() {
      super(stubs);
      outputs.forEach(({ propertyName }) => Object.assign(this, { [propertyName]: new EventEmitter() }));
    }
  }

  inputs.forEach(({ propertyName, alias }) => Input(alias)(Mock.prototype, propertyName));
  outputs.forEach(({ propertyName, alias }) => Output(alias)(Mock.prototype, propertyName));

  return Mock;
};
