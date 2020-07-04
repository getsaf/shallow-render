import { Type } from '@angular/core';

export const MockOf = (mockClass: Type<any>) => (constructor: Type<any>) => {
  Object.defineProperties(constructor, {
    mockOf: { value: mockClass },
    name: { value: `MockOf${mockClass.name}` },
  });
};
