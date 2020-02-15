import { Type } from '@angular/core';

/*
 JavaScript errors are stupid
 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error#Custom_Error_Types
*/

const ExtendableBuiltIn = <T>(cls: Type<T>): Type<T> => {
  function Extendable() {
    // @ts-ignore
    cls.apply(this, arguments);
  }
  Extendable.prototype = Object.create(cls.prototype);
  Object.setPrototypeOf(Extendable, cls);

  return Extendable as any;
};

export class CustomError extends ExtendableBuiltIn(Error) {
  constructor(message: string) {
    super();
    this.message = message;
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if ('captureStackTrace' in Error) {
      (Error as any).captureStackTrace(this, CustomError);
    }
  }
}
