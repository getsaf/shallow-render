import { Component } from '@angular/core';
import { TestSetup } from './test-setup';

describe('TestSetup', () => {
  @Component({
    selector: 'my-test-component',
    template: '<hr/>',
  })
  class MyTestComponent {}

  @Component({
    standalone: true,
    selector: 'my-standalone-component',
    template: '<hr/>',
  })
  class MyStandaloneComponent {}

  it('throws an error when no module is specified with a non-standalone component', () => {
    expect(() => new TestSetup(MyTestComponent)).toThrowError(/A module must be specified/);
  });

  it('throws an error when a module is specified with a standalone component', () => {
    expect(() => new TestSetup(MyStandaloneComponent, class {})).toThrowError(
      /Do not specify a module when testing .*\bstandalone\b/,
    );
  });

  it('adds the test item to the `dontMock` array', () => {
    expect(new TestSetup(MyTestComponent, class {}).dontMock).toEqual([MyTestComponent]);
  });
});
