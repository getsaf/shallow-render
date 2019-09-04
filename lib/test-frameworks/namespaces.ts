import { BaseArrayLikeMatchers } from './shallow-matchers';

// This seems to only really take effect if it's here
declare global {
  namespace jasmine {
    export interface ArrayLikeMatchers<T> extends BaseArrayLikeMatchers<T> {}
  }
  namespace jest {
    export interface Matchers<R> extends BaseArrayLikeMatchers<R> {}
  }
}
