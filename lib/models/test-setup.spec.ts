import { TestSetup } from './test-setup';

describe('TestSetup', () => {
  it('adds the testComponent to the dontMock array', () => {
    class TestComponent {}
    const setup = new TestSetup(TestComponent, class {});

    expect(setup.dontMock).toContain(TestComponent);
  });
});
