import { Shallow } from './shallow';
import { PipeTransform, InjectionToken } from '@angular/core';

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

  describe('alwaysProvide', () => {
    it('items are automatically added to setup.provide on construction', () => {
      class MyService {}
      Shallow.alwaysProvide(MyService);
      const shallow = new Shallow(TestComponent, TestModule);

      expect(shallow.setup.providers).toContain(MyService);
    });
  });

  describe('alwaysMock', () => {
    it('items are automatically added to setup.mock on construction', () => {
      class MyService {
        foo() { return 'foo'; }
      }
      Shallow.alwaysMock(MyService, {foo: () => 'mock foo'});
      const shallow = new Shallow(TestComponent, TestModule);

      expect(shallow.setup.mocks.get(MyService).foo()).toBe('mock foo');
    });

    it('can mock with an InjectionToken', () => {
      class MyService {
        myNumericMethod() {
          return 3;
        }
      }
      const myToken = new InjectionToken<MyService>('My Service token');
      const myMock = {myNumericMethod: () => 5};
      Shallow.alwaysMock(myToken, myMock);
      const shallow = new Shallow(TestComponent, TestModule);

      expect(shallow.setup.mocks.get(myToken)).toEqual(myMock);
    });

    it('mocking on an alwaysMock does not mutate the alwaysMock', () => {
      class MyService {
        foo() { return 'foo'; }
        bar() { return 'bar'; }
      }
      const alwaysMock = {
        foo: () => 'always mock foo',
        bar: () => 'always mock bar',
      };
      Shallow.alwaysMock(MyService, alwaysMock);
      const shallow = new Shallow(TestComponent, TestModule);
      shallow.mock(MyService, {foo: () => 'second foo'});
      const secondMock = shallow.setup.mocks.get(MyService);

      expect(alwaysMock.foo()).toBe('always mock foo');
      expect(alwaysMock.bar()).toBe('always mock bar');
      expect(secondMock.foo()).toBe('second foo');
      expect(secondMock.bar()).toBe('always mock bar');
    });
  });

  describe('dontMock', () => {
    it('adds things to setup.dontMock', () => {
      const shallow = new Shallow(TestComponent, TestModule)
        .dontMock('foo');

      expect(shallow.setup.dontMock).toContain('foo');
    });
  });

  describe('provide', () => {
    it('adds to the setup.providers array', () => {
      class MyService {}
      const shallow = new Shallow(TestComponent, TestModule)
        .provide(MyService);

      expect(shallow.setup.providers).toContain(MyService);
    });
  });

  describe('mock', () => {
    it('adds a mock to the mocks', () => {
      const shallow = new Shallow(TestComponent, TestModule)
        .mock(TestService, {foo: () => 'mocked foo'});

      expect(shallow.setup.mocks.get(TestService).foo())
        .toBe('mocked foo');
    });

    it('adds mocks on mocks', () => {
      const shallow = new Shallow(TestComponent, TestModule)
        .mock(TestService, {foo: () => 'mocked foo'})
        .mock(TestService, {foo: () => 'mocked foo two'});

      expect(shallow.setup.mocks.get(TestService).foo()).toBe('mocked foo two');
    });

    it('adds mocks to mocks', () => {
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
      expect(transform && transform()).toEqual({test: 'mocked pipe'});
    });
  });
});
