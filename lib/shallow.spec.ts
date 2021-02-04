import { Component, InjectionToken, NgModule, Pipe, PipeTransform } from '@angular/core';
import { Shallow } from './shallow';
import { InvalidStaticPropertyMockError } from './tools/mock-statics';
import { CustomError } from './models/custom-error';

class MyTestService {
  static staticFoo() {
    return 'static foo';
  }
  static staticBar() {
    return 'static bar';
  }
  foo() {
    return 'foo';
  }
  bar() {
    return 'bar';
  }
}
@Component({
  selector: 'my-test-component',
  template: '<hr/>',
})
class MyTestComponent {}

@Pipe({ name: 'myTestPipe' })
class MyTestPipe implements PipeTransform {
  transform() {
    return { test: 'pipe' };
  }
}

@NgModule({
  declarations: [MyTestComponent, MyTestPipe],
  providers: [MyTestService],
})
class MyTestModule {}

describe('Shallow', () => {
  it('includes the test component in setup.dontMock', () => {
    const shallow = new Shallow(MyTestComponent, MyTestModule);

    expect(shallow.setup.dontMock).toContain(MyTestComponent);
  });

  describe('neverMock', () => {
    it('items are automatically added to setup.dontMock on construction', () => {
      Shallow.neverMock('NEVER_MOCKED');
      const shallow = new Shallow(MyTestComponent, MyTestModule);

      expect(shallow.setup.dontMock).toContain('NEVER_MOCKED');
    });
  });

  describe('alwaysProvide', () => {
    it('automatically adds items to setup.provide on construction', () => {
      class MyService {}
      Shallow.alwaysProvide(MyService);
      const shallow = new Shallow(MyTestComponent, MyTestModule);

      expect(shallow.setup.providers).toContain(MyService);
    });
  });

  describe('alwaysReplaceModule', () => {
    it('automatically adds modules to setup.replacementModules on construction', () => {
      class ReplacementModule {}
      Shallow.alwaysReplaceModule(MyTestModule, ReplacementModule);
      const shallow = new Shallow(MyTestComponent, MyTestModule);

      expect(shallow.setup.moduleReplacements.get(MyTestModule)).toBe(ReplacementModule);
    });

    it('works with ModuleWithProviders', () => {
      const replacementModule = { ngModule: class {}, providers: [] };
      Shallow.alwaysReplaceModule(MyTestModule, replacementModule);
      const shallow = new Shallow(MyTestComponent, MyTestModule);

      expect(shallow.setup.moduleReplacements.get(MyTestModule)).toBe(replacementModule);
    });
  });

  describe('alwaysImport', () => {
    it('adds modules to setup.imports on construction', () => {
      @NgModule({})
      class MyModule {}
      Shallow.alwaysImport(MyModule);
      const shallow = new Shallow(MyTestComponent, MyModule);

      expect(shallow.setup.imports).toContain(MyModule);
    });
  });

  describe('alwaysMock', () => {
    it('automatically adds items to setup.mock on construction', () => {
      class MyService {
        foo() {
          return 'foo';
        }
      }
      Shallow.alwaysMock(MyService, { foo: () => 'mock foo' });
      const shallow = new Shallow(MyTestComponent, MyTestModule);

      expect(shallow.setup.mocks.get(MyService).foo()).toBe('mock foo');
    });

    it('can mock with an InjectionToken', () => {
      class MyService {
        myNumericMethod() {
          return 3;
        }
      }
      const myToken = new InjectionToken<MyService>('My Service token');
      const myMock = { myNumericMethod: () => 5 };
      Shallow.alwaysMock(myToken, myMock);
      const shallow = new Shallow(MyTestComponent, MyTestModule);

      expect(shallow.setup.mocks.get(myToken)).toEqual(myMock);
    });

    it('does not mutate the alwaysMock when re-mocked in a test', () => {
      class MyService {
        foo() {
          return 'foo';
        }
        bar() {
          return 'bar';
        }
      }
      const alwaysMock = {
        foo: () => 'always mock foo',
        bar: () => 'always mock bar',
      };
      Shallow.alwaysMock(MyService, alwaysMock);
      const shallow = new Shallow(MyTestComponent, MyTestModule);
      shallow.mock(MyService, { foo: () => 'second foo' });
      const secondMock = shallow.setup.mocks.get(MyService);

      expect(alwaysMock.foo()).toBe('always mock foo');
      expect(alwaysMock.bar()).toBe('always mock bar');
      expect(secondMock.foo()).toBe('second foo');
      expect(secondMock.bar()).toBe('always mock bar');
    });
  });

  describe('alwaysMockPipe', () => {
    it('automatically adds items to setup.mock on construction', () => {
      class MyPipe {
        transform() {
          return 'FOO';
        }
      }
      Shallow.alwaysMockPipe(MyPipe, () => 'mock foo');
      const shallow = new Shallow(MyTestComponent, MyTestModule);

      expect(shallow.setup.mockPipes.get(MyPipe)?.()).toBe('mock foo');
    });
  });

  describe('alwaysWithStructuralDirective', () => {
    it('adds the directive to the test setup', () => {
      class DummyDirective {}
      class DummyFalseDirective {}
      Shallow.alwaysWithStructuralDirective(DummyDirective, true);
      Shallow.alwaysWithStructuralDirective(DummyFalseDirective, false);
      const shallow = new Shallow(MyTestComponent, MyTestModule);

      expect(shallow.setup.withStructuralDirectives.get(DummyDirective)).toBe(true);
      expect(shallow.setup.withStructuralDirectives.get(DummyFalseDirective)).toBe(false);
    });
  });

  describe('dontMock', () => {
    it('adds things to setup.dontMock', () => {
      const shallow = new Shallow(MyTestComponent, MyTestModule).dontMock('foo');

      expect(shallow.setup.dontMock).toContain('foo');
    });
  });

  describe('provide', () => {
    it('adds to the beginning of setup.providers array', () => {
      class MyService {}
      class MyOtherService {}
      const shallow = new Shallow(MyTestComponent, MyTestModule).provide(MyService).provide(MyOtherService);

      expect(shallow.setup.providers.slice(0, 2)).toEqual([MyOtherService, MyService]);
    });
  });

  describe('provideMock', () => {
    it('adds to the beginning of the setup.providers and setup.dontMock', () => {
      class MyService {}
      class MyOtherService {}
      const shallow = new Shallow(MyTestComponent, MyTestModule).provideMock(MyService).provideMock(MyOtherService);

      expect(shallow.setup.providers.slice(0, 2)).toEqual([MyOtherService, MyService]);
      expect(shallow.setup.dontMock).toContain(MyService);
      expect(shallow.setup.dontMock).toContain(MyOtherService);
    });
  });

  describe('declare', () => {
    it('adds to the setup.declarations array', () => {
      class MyComponent {}
      const shallow = new Shallow(MyComponent, MyTestModule).declare(MyComponent);

      expect(shallow.setup.declarations).toContain(MyComponent);
    });
  });

  describe('import', () => {
    it('adds to the setup.imports array', () => {
      @NgModule({})
      class MyModule {}
      const shallow = new Shallow(MyTestComponent, MyModule).import(MyModule);

      expect(shallow.setup.imports).toContain(MyModule);
    });
  });

  describe('mock', () => {
    it('adds a mock to the mocks', () => {
      const shallow = new Shallow(MyTestComponent, MyTestModule).mock(MyTestService, { foo: () => 'mocked foo' });

      expect(shallow.setup.mocks.get(MyTestService).foo()).toBe('mocked foo');
    });

    it('adds mocks on mocks', () => {
      const shallow = new Shallow(MyTestComponent, MyTestModule)
        .mock(MyTestService, { foo: () => 'mocked foo' })
        .mock(MyTestService, { foo: () => 'mocked foo two' });

      expect(shallow.setup.mocks.get(MyTestService).foo()).toBe('mocked foo two');
    });

    it('adds mocks to mocks', () => {
      const shallow = new Shallow(MyTestComponent, MyTestModule)
        .mock(MyTestService, { foo: () => 'mocked foo' })
        .mock(MyTestService, { bar: () => 'mocked bar' });

      expect(shallow.setup.mocks.get(MyTestService).foo()).toBe('mocked foo');
      expect(shallow.setup.mocks.get(MyTestService).bar()).toBe('mocked bar');
    });
  });

  describe('mockStatic', () => {
    it('throws an error when a non-method property is mocked', async () => {
      const staticObject = {
        staticNumber: 999,
      };

      expect(() => new Shallow(MyTestComponent, MyTestModule).mockStatic(staticObject, { staticNumber: 999 })).toThrow(
        new InvalidStaticPropertyMockError('staticNumber')
      );
    });

    it('adds a static mock to the staticMocks', () => {
      const shallow = new Shallow(MyTestComponent, MyTestModule).mockStatic(MyTestService, {
        staticFoo: () => 'mocked foo',
      });

      expect(shallow.setup.staticMocks.get(MyTestService).staticFoo()).toBe('mocked foo');
    });

    it('adds mocks on mocks', () => {
      const shallow = new Shallow(MyTestComponent, MyTestModule)
        .mockStatic(MyTestService, { staticFoo: () => 'mocked foo' })
        .mockStatic(MyTestService, { staticFoo: () => 'mocked foo two' });

      expect(shallow.setup.staticMocks.get(MyTestService).staticFoo()).toBe('mocked foo two');
    });

    it('adds mocks to mocks', () => {
      const shallow = new Shallow(MyTestComponent, MyTestModule)
        .mockStatic(MyTestService, { staticFoo: () => 'mocked foo' })
        .mockStatic(MyTestService, { staticBar: () => 'mocked bar' });

      expect(shallow.setup.staticMocks.get(MyTestService).staticFoo()).toBe('mocked foo');
      expect(shallow.setup.staticMocks.get(MyTestService).staticBar()).toBe('mocked bar');
    });
  });

  describe('mockPipe', () => {
    it('adds pipe mocks with specific transforms', () => {
      const shallow = new Shallow(MyTestComponent, MyTestModule).mockPipe(MyTestPipe, () => ({ test: 'mocked pipe' }));

      const transform = shallow.setup.mockPipes.get(MyTestPipe);
      expect(transform && transform()).toEqual({ test: 'mocked pipe' });
    });
  });

  describe('replaceModule', () => {
    it('adds replacementModule', () => {
      class ReplacementModule {}
      const shallow = new Shallow(MyTestComponent, MyTestModule).replaceModule(MyTestModule, ReplacementModule);

      expect(shallow.setup.moduleReplacements.get(MyTestModule)).toBe(ReplacementModule);
    });
  });

  describe('withStructuralDirective', () => {
    it('adds the directive to the test setup', () => {
      class DummyDirective {}
      class DummyFalseDirective {}
      const shallow = new Shallow(MyTestComponent, MyTestModule)
        .withStructuralDirective(DummyDirective, true)
        .withStructuralDirective(DummyFalseDirective, false);

      expect(shallow.setup.withStructuralDirectives.get(DummyDirective)).toBe(true);
      expect(shallow.setup.withStructuralDirectives.get(DummyFalseDirective)).toBe(false);
    });
  });

  describe('render', () => {
    it('can render with only HTML', async () => {
      const { instance } = await new Shallow(MyTestComponent, MyTestModule).render(
        '<my-test-component></my-test-component>'
      );

      expect(instance).toBeInstanceOf(MyTestComponent);
    });

    it('can render with no parameters', async () => {
      const { instance } = await new Shallow(MyTestComponent, MyTestModule).render();

      expect(instance).toBeInstanceOf(MyTestComponent);
    });

    it('can render with only renderOptions', async () => {
      const { instance } = await new Shallow(MyTestComponent, MyTestModule).render({ detectChanges: false });

      expect(instance).toBeInstanceOf(MyTestComponent);
    });
  });

  describe('createService', () => {
    it('creates an instance of a service', () => {
      const shallow = new Shallow(MyTestService, MyTestModule);
      const { instance } = shallow.createService();

      expect(instance).toBeInstanceOf(MyTestService);
    });
  });
});
