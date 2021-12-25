/**
 * Utility type that converts an object to recursively have optional properties.
 * This includes items an arrays and return values for functions.
 */
export type RecursivePartial<T> = Partial<{
  [key in keyof T]: T[key] extends (...a: Array<infer U>) => any
    ? (...a: Array<U>) => RecursivePartial<ReturnType<T[key]>> | ReturnType<T[key]> // tslint:disable-line
    : T[key] extends Array<any>
    ? Array<RecursivePartial<T[key][number]>>
    : RecursivePartial<T[key]> | T[key];
}>;
