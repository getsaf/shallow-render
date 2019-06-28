import { Component, InjectionToken, NgModule, Pipe, PipeTransform } from '@angular/core';
import { InvalidStaticPropertyMockError } from './models/renderer';
import { Shallow } from './shallow';

class TestService {
  static staticFoo() { return 'static foo'; }
  static staticBar() { return 'static bar'; }
  foo() { return 'foo'; }
  bar() { return 'bar'; }
}
@Component({
  selector: 'test',
  template: '<hr/>'
}) class TestComponent {}

@Pipe({name: 'test'})
class TestPipe implements PipeTransform {
  transform() {
    return {test: 'pipe'};
  }
}

@NgModule({
  declarations: [TestComponent, TestPipe]
})
class TestModule {}

describe('Shallow', () => {
  it('includes the testComponent in setup.dontMock', () => {
    const shallow = new Shallow(TestComponent, TestModule);

    expect(shallow.setup.dontMock).toContain(TestComponent);
  });

  describe('neverMock', () => { it('items are automatically added to setup.dontMock on construction', () => {
      Shallow.neverMock('NEVER_MOCKED');
      const shallow = new Shallow(TestComponent, TestModule);

      expect(shallow.setup.dontMock).toContain('NEVER_MOCKED');
    });
  });

  describe('alwaysProvide', () => {
    it('automatically adds items to setup.provide on construction', () => {
      class MyService {}
      Shallow.alwaysProvide(MyService);
      const shallow = new Shallow(TestComponent, TestModule);

      expect(shallow.setup.providers).toContain(MyService);
    });
  });

  describe('alwaysReplaceModule', () => {
    it('automatically adds modules to setup.replacementModules on construction', () => {
      class ReplacementModule {}
      Shallow.alwaysReplaceModule(TestModule, ReplacementModule);
      const shallow = new Shallow(TestComponent, TestModule);

      expect(shallow.setup.moduleReplacements.get(TestModule))
        .toBe(ReplacementModule);
    });

    it('works with ModuleWithProviders', () => {
      const replacementModule = {ngModule: class {}, providers: []};
      Shallow.alwaysReplaceModule(TestModule, replacementModule);
      const shallow = new Shallow(TestComponent, TestModule);

      expect(shallow.setup.moduleReplacements.get(TestModule))
        .toBe(replacementModule);
    });
  });

  describe('alwaysImport', () => {
    it('adds modules to setup.imports on construction', () => {
      @NgModule({}) class MyModule {}
      Shallow.alwaysImport(MyModule);
      const shallow = new Shallow(TestComponent, TestModule);

      expect(shallow.setup.imports).toContain(MyModule);
    });
  });

  describe('alwaysMock', () => {
    it('automatically adds items to setup.mock on construction', () => {
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

  describe('declare', () => {
    it('adds to the setup.declarations array', () => {
      class MyComponent {}
      const shallow = new Shallow(TestComponent, TestModule)
        .declare(MyComponent);

      expect(shallow.setup.declarations).toContain(MyComponent);
    });
  });

  describe('import', () => {
    it('adds to the setup.imports array', () => {
      @NgModule({}) class MyModule {}
      const shallow = new Shallow(TestComponent, TestModule)
        .import(MyModule);

      expect(shallow.setup.imports).toContain(MyModule);
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

  describe('mockStatic', () => {
    it('throws an error when a non-method property is mocked', async () => {
      const staticObject = {
        staticNumber: 999
      };

      expect(() => new Shallow(TestComponent, TestModule)
        .mockStatic(staticObject, {staticNumber: 999}))
        .toThrow(new InvalidStaticPropertyMockError('staticNumber'));
    });

    it('adds a static mock to the staticMocks', () => {
      const shallow = new Shallow(TestComponent, TestModule)
        .mockStatic(TestService, {staticFoo: () => 'mocked foo'});

      expect(shallow.setup.staticMocks.get(TestService).staticFoo())
        .toBe('mocked foo');
    });

    it('adds mocks on mocks', () => {
      const shallow = new Shallow(TestComponent, TestModule)
        .mockStatic(TestService, {staticFoo: () => 'mocked foo'})
        .mockStatic(TestService, {staticFoo: () => 'mocked foo two'});

      expect(shallow.setup.staticMocks.get(TestService).staticFoo()).toBe('mocked foo two');
    });

    it('adds mocks to mocks', () => {
      const shallow = new Shallow(TestComponent, TestModule)
        .mockStatic(TestService, {staticFoo: () => 'mocked foo'})
        .mockStatic(TestService, {staticBar: () => 'mocked bar'});

      expect(shallow.setup.staticMocks.get(TestService).staticFoo()).toBe('mocked foo');
      expect(shallow.setup.staticMocks.get(TestService).staticBar()).toBe('mocked bar');
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

  describe('replaceModule', () => {
    it('adds replacementModule', () => {
      class ReplacementModule {}
      const shallow = new Shallow(TestComponent, TestModule)
        .replaceModule(TestModule, ReplacementModule);

      expect(shallow.setup.moduleReplacements.get(TestModule))
        .toBe(ReplacementModule);
    });
  });

  describe('render', () => {
    it('can render with only HTML', async () => {
      const {instance} = await new Shallow(TestComponent, TestModule)
        .render('<test></test>');

      expect(instance instanceof TestComponent).toBe(true);
    });

    it('can render with no parameters', async () => {
      const {instance} = await new Shallow(TestComponent, TestModule)
        .render();

      expect(instance instanceof TestComponent).toBe(true);
    });

    it('can render with only renderOptions', async () => {
      const {instance} = await new Shallow(TestComponent, TestModule)
        .render({detectChanges: false});

      expect(instance instanceof TestComponent).toBe(true);
    });
  });
});
