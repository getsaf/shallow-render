/**
 * Utility type that converts an object to recursively have optional properties.
 * This includes items an arrays and return values for functions.
 */
import { InputSignal } from '@angular/core';

export type RecursivePartial<T> = Partial<{
  [key in keyof T]:
  T[key] extends InputSignal<infer U>  // Handle signals like input() and input.required()
    ? RecursivePartial<U>  // Extract the type and recursively apply RecursivePartial
    : T[key] extends (...a: Array<infer U>) => any // Function-based properties (like methods or other signals)
      ? (...a: Array<U>) => RecursivePartial<ReturnType<T[key]>> | ReturnType<T[key]>
      : T[key] extends Array<any> // Handle array types
        ? Array<RecursivePartial<T[key][number]>>
        : RecursivePartial<T[key]> | T[key]; // Handle other standard cases
}>;