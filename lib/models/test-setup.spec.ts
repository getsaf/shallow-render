import { TestSetup } from './test-setup';

describe('', () => {
  it('adds the testComponent to the dontMock array', () => {
    class TestComponent {}
    const setup = new TestSetup(TestComponent, class {});

    expect(setup.dontMock).toContain(TestComponent);
  });

  it('adds the dontMock constructor parameter to the dontMock array', () => {
    class TestComponent {}
    const setup = new TestSetup(TestComponent, class {}, ['foo']);

    expect(setup.dontMock).toContain('foo');
  });
});
