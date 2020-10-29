import {
  Component,
  Directive,
  ModuleWithProviders,
  NgModule,
  Pipe,
  PipeTransform,
  Output,
  EventEmitter,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TestSetup } from '../models/test-setup';
import * as mockModuleLib from './mock-module';
import { ngMock } from './ng-mock';
import * as mockPipeModule from './mock-pipe';
import * as mockComponentModule from './mock-component';
import * as mockDirectiveModule from './mock-directive';
import { ngModuleResolver } from './reflect';

@Component({ template: '<label>foo</label>' })
class FooComponent {
  @Output() fooOutput = new EventEmitter<boolean>();
  doFoo() {
    return 'doFoo';
  }
}

@Directive({ selector: '[foo]' })
class FooDirective {}

@Pipe({ name: 'foo' })
class FooPipe implements PipeTransform {
  transform(input: string) {
    return `${input} piped to foo`;
  }
}

@NgModule({
  declarations: [FooComponent, FooDirective, FooPipe],
})
class FooModule {}

describe('ng-mock', () => {
  let testSetup: TestSetup<any>;

  beforeEach(() => {
    testSetup = new TestSetup(class {}, class {});
  });

  it('uses cached mocks instead of re-mocking components', () => {
    class MockOne {}
    class MockTwo {}
    spyOn(mockComponentModule, 'mockComponent').and.returnValues(MockOne, MockTwo);
    ngMock(FooComponent, testSetup);
    const FinalMock = ngMock(FooComponent, testSetup);

    expect(FinalMock).toBe(MockOne as any);
  });

  it('throws a friendly message when mocking fails', () => {
    class BadComponent {}
    spyOn(ngModuleResolver, 'isNgModule').and.throwError('BOOM');

    expect(() => ngMock(BadComponent, testSetup)).toThrowError(/Shallow.*BadComponent[\s\S]*BOOM/g);
  });

  it('mocks a component', () => {
    class MockComponent {}
    spyOn(mockComponentModule, 'mockComponent').and.returnValue(MockComponent);
    const mocked = ngMock(FooComponent, testSetup);

    expect(mocked).toBe(MockComponent as any);
  });

  it('mocks a component with both a directive and component decorator', () => {
    // Some libraries do this. It makes no sense, but if we don't detect these
    // and mock them as components, things break when the component is defined as
    // an entry component in a module
    @Directive()
    @Component({ selector: 'dummy-selector', template: '' })
    class ComponentWithDirectiveAndComponentDecorators {}
    class MockComponent {}
    spyOn(mockComponentModule, 'mockComponent').and.returnValue(MockComponent);
    const mocked = ngMock(ComponentWithDirectiveAndComponentDecorators, testSetup);

    expect(mocked).toBe(MockComponent as any);
  });

  describe('components with mocks', () => {
    it('adds stubs to components', () => {
      testSetup.mocks.set(FooComponent, { doFoo: () => 'mocked doFoo' });
      const MockedFoo = ngMock(FooComponent, testSetup);
      const foo = new MockedFoo();

      expect(foo.doFoo()).toBe('mocked doFoo');
    });

    it('spys on component stubs', () => {
      testSetup.mocks.set(FooComponent, { doFoo: () => 'mocked doFoo' });
      const MockedFoo = ngMock(FooComponent, testSetup);
      const foo = new MockedFoo();

      foo.doFoo();
      expect(foo.doFoo).toHaveBeenCalled(); // doFoo should be a spy
    });

    it('keeps the existing outputs from the ng-mockd componeent when stubbing new fields', () => {
      testSetup.mocks.set(FooComponent, { doFoo: () => 'mocked doFoo' });
      const MockedFoo = ngMock(FooComponent, testSetup);
      const foo = new MockedFoo();

      expect(foo.fooOutput).toBeInstanceOf(EventEmitter);
    });

    it('uses MockOf* in the mocked component class name', () => {
      testSetup.mocks.set(FooComponent, {});
      const MockedFoo = ngMock(FooComponent, testSetup);

      expect(MockedFoo.name).toBe('MockOfFooComponent');
    });
  });

  it('mocks a directive', () => {
    class MockDirective {}
    spyOn(mockDirectiveModule, 'mockDirective').and.returnValue(MockDirective);
    const mocked = ngMock(FooDirective, testSetup);

    expect(mocked).toBe(MockDirective);
  });

  it('mocks a pipe', () => {
    class MockPipe implements PipeTransform {
      transform() {}
    }
    spyOn(mockPipeModule, 'mockPipe').and.returnValue(MockPipe as any);
    const mocked = ngMock(FooPipe, testSetup);

    expect(mocked).toBe(MockPipe);
  });

  it('mocks a pipe with user-provided pipe transforms', () => {
    testSetup.mockPipes.set(FooPipe, () => 'MOCKED TRANSFORM');
    const mocked = ngMock(FooPipe, testSetup) as any;

    expect(new mocked().transform()).toBe('MOCKED TRANSFORM');
  });

  it('mocks modules', () => {
    class MockModule {}
    spyOn(mockModuleLib, 'mockModule').and.returnValue(MockModule);
    const mocked = ngMock(FooModule, testSetup);

    expect(mocked).toBe(MockModule);
  });

  it('mocks modules with providers', () => {
    class MockModule {}
    spyOn(mockModuleLib, 'mockModule').and.returnValue(MockModule);
    class FooService {}

    const moduleWithProviders: ModuleWithProviders<FooModule> = {
      ngModule: FooModule,
      providers: [FooService],
    };

    const mocked = ngMock(moduleWithProviders, testSetup) as any;

    expect(mocked).toBe(MockModule);
  });

  it('mocks arrays of things', () => {
    class MockComponent {}
    class MockDirective {}
    class MockPipe implements PipeTransform {
      transform = () => undefined;
    }
    class MockModule {}
    spyOn(mockComponentModule, 'mockComponent').and.returnValue(MockComponent);
    spyOn(mockDirectiveModule, 'mockDirective').and.returnValue(MockDirective);
    spyOn(mockPipeModule, 'mockPipe').and.returnValue(MockPipe);
    spyOn(mockModuleLib, 'mockModule').and.returnValue(MockModule);
    const mocked = ngMock([FooComponent, FooDirective, FooPipe, FooModule], testSetup);

    expect(mocked).toEqual([MockComponent, MockDirective, MockPipe, MockModule]);
  });

  it('works in TestBed when mocking a component without a selector', async () => {
    @Component({ template: '' })
    class NoSelectorComponent {}
    const mocked = ngMock(NoSelectorComponent, testSetup);
    await TestBed.configureTestingModule({ declarations: [mocked] }).compileComponents();

    expect(true).toBe(true);
  });

  it('does not mock things in setup.dontMock', () => {
    const DontMockMe = class {};
    testSetup.dontMock.push(DontMockMe);
    const mocked = ngMock(DontMockMe, testSetup);

    expect(mocked).toBe(DontMockMe);
  });

  it('does not mock modules when used in an ModuleWithProviders', () => {
    class DontMockThisModule {}
    class DontMockThisProvider {}
    const moduleWithProviders: ModuleWithProviders<DontMockThisModule> = {
      ngModule: DontMockThisModule,
      providers: [DontMockThisProvider],
    };

    testSetup.dontMock.push(DontMockThisModule);
    const mocked = ngMock(moduleWithProviders, testSetup);

    expect(mocked).toBe(moduleWithProviders);
  });

  it('renders on ngOnInit for all directives when alwaysRenderStructuralDirectives is true', () => {
    testSetup.alwaysRenderStructuralDirectives = true;
    const mocked = ngMock(FooDirective, testSetup);
    const instance = new mocked() as mockDirectiveModule.MockDirective;
    spyOn(instance, 'renderContents');
    (instance as any).ngOnInit();

    expect(instance.renderContents).toHaveBeenCalled();
  });

  it('renders on ngOnInit for directives specified in withStructuralDirective', () => {
    testSetup.alwaysRenderStructuralDirectives = false;
    testSetup.withStructuralDirectives.set(FooDirective, true);
    const mocked = ngMock(FooDirective, testSetup);
    const instance = new mocked() as mockDirectiveModule.MockDirective;
    spyOn(instance, 'renderContents');
    (instance as any).ngOnInit();

    expect(instance.renderContents).toHaveBeenCalled();
  });

  it('does not render on ngOnInit for directives not specified in withStructuralDirective', () => {
    class BarDirective extends FooDirective {}
    testSetup.alwaysRenderStructuralDirectives = false;
    testSetup.withStructuralDirectives.set(BarDirective, false);
    const mocked = ngMock(BarDirective, testSetup);
    const instance = new mocked() as mockDirectiveModule.MockDirective;
    spyOn(instance, 'renderContents');
    (instance as any).ngOnInit?.();

    expect(instance.renderContents).not.toHaveBeenCalled();
  });
});
