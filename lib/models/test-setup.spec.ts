import { TestSetup } from './test-setup';

describe('TestSetup', () => {
  it('adds the testComponent to the dontMock array', () => {
    class TestComponent {}
    const setup = new TestSetup(TestComponent, class {});

    expect(setup.dontMock).toContain(TestComponent);
  });

  it('adds the dontMock constructor parameter to the dontMock array', () => {
    const setup = new TestSetup(class {}, class {}, ['foo']);

    expect(setup.dontMock).toContain('foo');
  });

  it('adds the providers constructor parameter to the providers array', () => {
    class MyService {}
    const setup = new TestSetup(class {}, class {}, undefined, [MyService]);

    expect(setup.providers).toContain(MyService);
  });
});
