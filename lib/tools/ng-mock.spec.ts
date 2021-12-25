import {
  Component,
  Directive,
  ModuleWithProviders,
  NgModule,
  Pipe,
  PipeTransform,
  Output,
  EventEmitter,
  ValueProvider,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TestSetup } from '../models/test-setup';
import { ngMock } from './ng-mock';
import * as mockDirectiveModule from './mock-directive';
import { reflect } from './reflect';

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
    const FirstMock = ngMock(FooComponent, testSetup);
    const SecondMock = ngMock(FooComponent, testSetup);

    expect(SecondMock).toBe(FirstMock);
  });

  it('throws a friendly message when mocking fails', () => {
    class BadComponent {}
    jest.spyOn(reflect, 'isNgModule').mockImplementation(() => {
      throw new Error('BOOM');
    });

    expect(() => ngMock(BadComponent, testSetup)).toThrowError(/Shallow.*BadComponent[\s\S]*BOOM/g);
  });

  it('mocks a component', () => {
    const MockedComponent = ngMock(FooComponent, testSetup);

    expect(reflect.isComponent(MockedComponent)).toBe(true);
    expect(MockedComponent.name).toBe('MockOfFooComponent');
  });

  it('mocks a component with both a directive and component decorator', () => {
    // Some libraries do this. It makes no sense, but if we don't detect these
    // and mock them as components, things break when the component is defined as
    // an entry component in a module
    @Directive()
    @Component({ selector: 'dummy-selector', template: '' })
    class ComponentWithDirectiveAndComponentDecorators {}
    const MockedCombo = ngMock(ComponentWithDirectiveAndComponentDecorators, testSetup);

    expect(MockedCombo.name).toBe('MockOfComponentWithDirectiveAndComponentDecorators');
  });

  describe('components with mocks', () => {
    it('adds stubs to components', () => {
      testSetup.mocks.set(FooComponent, { doFoo: () => 'mocked doFoo' });
      const MockedComponent = ngMock(FooComponent, testSetup);
      const mock = new MockedComponent();

      expect(mock.doFoo()).toBe('mocked doFoo');
    });

    it('spys on component stubs', () => {
      testSetup.mocks.set(FooComponent, { doFoo: () => 'mocked doFoo' });
      const MockedComponent = ngMock(FooComponent, testSetup);
      const mock = new MockedComponent();

      mock.doFoo();
      expect(mock.doFoo).toHaveBeenCalled(); // doFoo should be a spy
    });

    it('keeps the existing outputs from the ng-mockd componeent when stubbing new fields', () => {
      testSetup.mocks.set(FooComponent, { doFoo: () => 'mocked doFoo' });
      const MockedComponent = ngMock(FooComponent, testSetup);
      const mock = new MockedComponent();

      expect(mock.fooOutput).toBeInstanceOf(EventEmitter);
    });

    it('uses MockOf* in the mocked component class name', () => {
      testSetup.mocks.set(FooComponent, {});
      const MockedComponent = ngMock(FooComponent, testSetup);

      expect(MockedComponent.name).toBe('MockOfFooComponent');
    });
  });

  it('mocks a directive', () => {
    const MockedDirective = ngMock(FooDirective, testSetup);

    expect(reflect.isDirective(MockedDirective)).toBe(true);
    expect(MockedDirective.name).toBe('MockOfFooDirective');
  });

  it('mocks a pipe', () => {
    const MockedPipe = ngMock(FooPipe, testSetup);

    expect(reflect.isPipe(MockedPipe)).toBe(true);
    expect(MockedPipe.name).toBe('MockOfFooPipe');
  });

  it('mocks a pipe with user-provided pipe transforms', () => {
    testSetup.mockPipes.set(FooPipe, () => 'MOCKED TRANSFORM');
    const MockedPipe = ngMock(FooPipe, testSetup) as any;

    expect(new MockedPipe().transform()).toBe('MOCKED TRANSFORM');
  });

  it('mocks modules', () => {
    const MockedModule = ngMock(FooModule, testSetup);

    expect(reflect.isNgModule(MockedModule)).toBe(true);
    expect(MockedModule.name).not.toBe('MockOfFoo');
  });

  it('mocks modules with providers', () => {
    class FooService {}

    const moduleWithProviders: ModuleWithProviders<FooModule> = {
      ngModule: FooModule,
      providers: [FooService],
    };

    const mock = ngMock(moduleWithProviders, testSetup) as typeof moduleWithProviders;

    // tslint:disable-next-line: no-non-null-assertion
    const providers = mock.providers as ValueProvider[];
    expect(mock.ngModule.name).toBe('MockOfFooModule');
    expect(providers.length).toBe(1);
    expect(providers[0].provide).toBe(FooService);
    expect(providers[0].useValue.constructor.name).toBe('MockOfFooService');
  });

  it('mocks arrays of things', () => {
    const mocked = ngMock([FooComponent, FooDirective, FooPipe, FooModule], testSetup);

    expect(mocked.map(m => m.name)).toEqual([
      'MockOfFooComponent',
      'MockOfFooDirective',
      'MockOfFooPipe',
      'MockOfFooModule',
    ]);
    expect(reflect.isComponent(mocked[0])).toBe(true);
    expect(reflect.isDirective(mocked[1])).toBe(true);
    expect(reflect.isPipe(mocked[2])).toBe(true);
    expect(reflect.isNgModule(mocked[3])).toBe(true);
  });

  it('works in TestBed and does not error when mocking a component without a selector', async () => {
    @Component({ template: '' })
    class NoSelectorComponent {}
    const mocked = ngMock(NoSelectorComponent, testSetup);

    await expect(TestBed.configureTestingModule({ declarations: [mocked] }).compileComponents()).resolves.toBe(
      undefined
    );
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
    jest.spyOn(instance, 'renderContents');
    (instance as any).ngOnInit();

    expect(instance.renderContents).toHaveBeenCalled();
  });

  it('renders on ngOnInit for directives specified in withStructuralDirective', () => {
    testSetup.alwaysRenderStructuralDirectives = false;
    testSetup.withStructuralDirectives.set(FooDirective, true);
    const mocked = ngMock(FooDirective, testSetup);
    const instance = new mocked() as mockDirectiveModule.MockDirective;
    jest.spyOn(instance, 'renderContents');
    (instance as any).ngOnInit();

    expect(instance.renderContents).toHaveBeenCalled();
  });

  it('does not render on ngOnInit for directives not specified in withStructuralDirective', () => {
    class BarDirective extends FooDirective {}
    testSetup.alwaysRenderStructuralDirectives = false;
    testSetup.withStructuralDirectives.set(BarDirective, false);
    const mocked = ngMock(BarDirective, testSetup);
    const instance = new mocked() as mockDirectiveModule.MockDirective;
    jest.spyOn(instance, 'renderContents');
    (instance as any).ngOnInit?.();

    expect(instance.renderContents).not.toHaveBeenCalled();
  });
});
