import { Component, Directive, ModuleWithProviders, Pipe, PipeTransform, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ngMock } from './ng-mock';
import { TestSetup } from '../models/test-setup';
import * as mockModuleLib from './mock-module';
import * as ngMocksLib from 'ng-mocks';

@Component({
  template: '<label>foo</label>'
})
class FooComponent {
  doFoo() { return 'doFoo'; }
}

@Directive({
  selector: '[foo]'
})
class FooDirective {}

@Pipe({name: 'foo'})
class FooPipe implements PipeTransform {
  transform(input: string) {
    return `${input} piped to foo`;
  }
}

@NgModule({
  declarations: [FooComponent, FooDirective, FooPipe]
})
class FooModule {}

describe('ng-mock', () => {
  let  testSetup: TestSetup<any>;

  beforeEach(() => {
    testSetup = new TestSetup(class {}, class {});
  });

  it('uses cached mocks instead of re-mocking components', () => {
    spyOn(ngMocksLib, 'MockDeclaration').and.returnValues('FIRST', 'SECOND');
    ngMock(FooComponent, testSetup);
    const mockedSecond = ngMock(FooComponent, testSetup);

    expect(mockedSecond).toBe('FIRST' as any);
  });

  it('throws a friendly message when mocking fails', () => {
    class BadComponent {}
    spyOn(ngMocksLib, 'MockDeclaration').and.throwError('BOOM');

    expect(() => ngMock(BadComponent, testSetup))
      .toThrowError(/Shallow.*BadComponent[\s\S]*BOOM/g);
  });

  it('mocks a component', () => {
    spyOn(ngMocksLib, 'MockDeclaration').and.returnValue('MOCKED');
    const mocked = ngMock(FooComponent, testSetup);

    expect(mocked).toBe('MOCKED' as any);
  });

  describe('components with mocks', () => {
    it('adds stubs to components', () => {
      testSetup.mocks.set(FooComponent, {doFoo: () => 'mocked doFoo'});
      const MockedFoo = ngMock(FooComponent, testSetup);
      const foo = new MockedFoo();

      expect(foo.doFoo()).toBe('mocked doFoo');
    });

    it('spys on component stubs', () => {
      testSetup.mocks.set(FooComponent, {doFoo: () => 'mocked doFoo'});
      const MockedFoo = ngMock(FooComponent, testSetup);
      const foo = new MockedFoo();

      foo.doFoo();
      expect(foo.doFoo).toHaveBeenCalled(); // doFoo should be a spy
    });

    it('uses MockOf* in the mocked component class name', () => {
      testSetup.mocks.set(FooComponent, {});
      const MockedFoo = ngMock(FooComponent, testSetup);
      const foo = new MockedFoo();

      expect(foo.constructor.name).toBe('MockOfFooComponent');
    });
  });

  it('mocks a directive', () => {
    spyOn(ngMocksLib, 'MockDeclaration').and.returnValue('MOCKED');
    const mocked = ngMock(FooDirective, testSetup);

    expect(mocked).toBe('MOCKED' as any);
  });

  it('mocks a pipe', () => {
    spyOn(ngMocksLib, 'MockPipe').and.returnValue('MOCKED');
    const mocked = ngMock(FooPipe, testSetup);

    expect(mocked).toBe('MOCKED' as any);
  });

  it('mocks a pipe with user-provided pipe transforms', () => {
    testSetup.mockPipes.set(FooPipe, () => 'MOCKED TRANSFORM');
    const mocked = ngMock(FooPipe, testSetup) as any;

    expect(new mocked().transform()).toBe('MOCKED TRANSFORM');
  });

  it('mocks modules', () => {
    spyOn(mockModuleLib, 'mockModule').and.returnValue('MOCKED');
    const mocked = ngMock(FooModule, testSetup);

    expect(mocked).toBe('MOCKED' as any);
  });

  it('mocks modules with providers', () => {
    spyOn(mockModuleLib, 'mockModule').and.returnValue('MOCKED');
    class FooService {}

    const moduleWithProviders: ModuleWithProviders = {
      ngModule: FooModule,
      providers: [FooService]
    };

    const mocked = ngMock(moduleWithProviders, testSetup) as any;

    expect(mocked).toBe('MOCKED');
  });

  it('mocks arrays of things', () => {
    spyOn(ngMocksLib, 'MockDeclaration').and.returnValue('DECLARATION');
    spyOn(ngMocksLib, 'MockPipe').and.returnValue('PIPE');
    spyOn(mockModuleLib, 'mockModule').and.returnValue('MODULE');
    const mocked = ngMock(
      [
        FooComponent,
        FooDirective,
        FooPipe,
        FooModule,
      ],
      testSetup
    ) as any;

    expect(mocked).toEqual(['DECLARATION', 'DECLARATION', 'PIPE', 'MODULE']);
  });

  it('works in TestBed when mocking a component without a selector', async () => {
    @Component({template: ''})
    class NoSelectorComponent {}

    const mocked = ngMock(NoSelectorComponent, testSetup);
    await TestBed.configureTestingModule({
      declarations: [mocked]
    }).compileComponents();
  });

  it('does not mock things in setup.dontMock', () => {
    const DontMockMe = class {};
    testSetup.dontMock.push(DontMockMe);
    const mocked = ngMock(DontMockMe, testSetup);

    expect(mocked).toBe(DontMockMe);
  });

  it('does not mock modules when used in an ModuleWithProviders', () => {
    const DontMockThisModule = class {};
    const DontMockThisProvider = class {};
    const moduleWithProviders: ModuleWithProviders = {
      ngModule: DontMockThisModule,
      providers: [DontMockThisProvider]
    };

    testSetup.dontMock.push(DontMockThisModule);
    const mocked = ngMock(moduleWithProviders, testSetup);

    expect(mocked).toBe(moduleWithProviders);
  });
});
