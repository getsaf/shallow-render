import { Shallow } from './shallow';
import { PipeTransform } from '@angular/core';

class TestService {
  foo() { return 'foo'; }
  bar() { return 'bar'; }
}
class TestComponent {}
class TestModule {}
class TestPipe implements PipeTransform {
  transform(key: string) {
    return {test: 'pipe'};
  }
}

describe('Shallow', () => {
  it('includes the testComponent in setup.dontMock', () => {
    const shallow = new Shallow(TestComponent, TestModule);

    expect(shallow.setup.dontMock).toContain(TestComponent);
  });

  describe('neverMock', () => {
    it('items are automatically added to setup.dontMock on construction', () => {
      Shallow.neverMock('NEVER_MOCKED');
      const shallow = new Shallow(TestComponent, TestModule);

      expect(shallow.setup.dontMock).toContain('NEVER_MOCKED');
    });
  });

  describe('dontMock', () => {
    it('adds things to setup.dontMock', () => {
      const shallow = new Shallow(TestComponent, TestModule)
        .dontMock('foo');

      expect(shallow.setup.dontMock).toContain('foo');
    });
  });

  describe('mock', () => {
    it('adds a mock to the mocks', async () => {
      const shallow = new Shallow(TestComponent, TestModule)
        .mock(TestService, {foo: () => 'mocked foo'});

      expect(shallow.setup.mocks.get(TestService).foo())
        .toBe('mocked foo');
    });

    it('adds mocks on mocks', async () => {
      const shallow = new Shallow(TestComponent, TestModule)
        .mock(TestService, {foo: () => 'mocked foo'})
        .mock(TestService, {foo: () => 'mocked foo two'});

      expect(shallow.setup.mocks.get(TestService).foo()).toBe('mocked foo two');
    });

    it('adds mocks to mocks', async () => {
      const shallow = new Shallow(TestComponent, TestModule)
        .mock(TestService, {foo: () => 'mocked foo'})
        .mock(TestService, {bar: () => 'mocked bar'});

      expect(shallow.setup.mocks.get(TestService).foo()).toBe('mocked foo');
      expect(shallow.setup.mocks.get(TestService).bar()).toBe('mocked bar');
    });
  });

  describe('mockPipe', () => {
    it('adds pipe mocks with specific transforms', () => {
      const shallow = new Shallow(TestComponent, TestModule)
        .mockPipe(TestPipe, () => ({test: 'mocked pipe'}));

      const transform = shallow.setup.mockPipes.get(TestPipe);
      expect(transform()).toEqual({test: 'mocked pipe'});
    });
  });
});
