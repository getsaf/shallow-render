// tslint:disable
namespace jasmine {
  export interface ArrayLikeMatchers<T> {
    toHaveFoundOne(): void;
    toHaveFoundMoreThan(count: number): void;
    toHaveFoundLessThan(count: number): void;
    toHaveFound(count: number): void;
  }
}
