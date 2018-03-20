import { Component, Directive } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { MockComponent, MockDirective } from 'ng-mocks';
import { Rendering } from './rendering';
import { MockCache } from './mock-cache';
import { TestSetup } from './test-setup';

@Component({
  template: '<outer></outer>',
})
class TestHostComponent {}

@Directive({
  selector: '[directive-to-mock]',
})
class DirectiveToMock {}

@Directive({
  selector: '[test-directive]',
})
class TestDirective {}

@Component({
  selector: 'outer',
  template: `
    <div class="outer">
      <inner directive-to-mock></inner>
      <component-to-mock></component-to-mock>
    </div>
  `,
})
class OuterComponent {}

@Component({
  selector: 'inner',
  template: '<span test-directive>sub</span>',
})
class InnerComponent {}

@Component({
  selector: 'component-to-mock',
  template: '<span>this will not render<span>',
})
class ComponentToMock {}

describe('Rendering', () => {
  let testSetup: TestSetup<OuterComponent>;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    const MockedDirective = MockDirective(DirectiveToMock);
    const MockedComponent = MockComponent(ComponentToMock);
    const mockCache = new MockCache();
    mockCache.add(DirectiveToMock, MockedDirective);
    mockCache.add(ComponentToMock, MockedComponent);
    testSetup = {
      dontMock: [],
      mockCache,
      mocks: new Map<any, any>(),
      mockPipes: new Map<any, any>(),
      testComponent: OuterComponent,
      testModule: class {},
    };
    return TestBed.configureTestingModule({
      declarations: [
        TestHostComponent,
        OuterComponent,
        InnerComponent,
        TestDirective,
        MockedComponent,
        MockedDirective,
      ],
    }).compileComponents().then(() => {
      fixture = TestBed.createComponent(TestHostComponent);
      fixture.detectChanges();
    });
  });

  describe('find', () => {
    it('can be destructured', () => {
      const {find} = new Rendering(fixture, {}, testSetup);

      expect(() => find('some-css-selector')).not.toThrowError();
    });

    it('throws an error when used to find the test component by CSS', () => {
      const {find} = new Rendering(fixture, {}, testSetup);

      expect(() => find('outer')).toThrow();
    });

    it('does not throw an error when used to find an inner element of the test component', () => {
      const {find} = new Rendering(fixture, {}, testSetup);

      expect(() => find('div.outer')).not.toThrow();
    });

    it('throws an error when used to find the test component by Directive', () => {
      const {find} = new Rendering(fixture, {}, testSetup);

      expect(() => find(OuterComponent)).toThrow();
    });

    it('can find things by CSS', () => {
      const {find} = new Rendering(fixture, {}, testSetup);

      expect(find('inner').length).toBe(1);
    });

    it('can find by Component', () => {
      const {find} = new Rendering(fixture, {}, testSetup);

      expect(find(InnerComponent).length).toBe(1);
    });

    it('finds by mocked Components', () => {
      const {find} = new Rendering(fixture, {}, testSetup);

      expect(find(ComponentToMock).length).toBe(1);
    });

    it('can find by Directive', () => {
      const {find} = new Rendering(fixture, {}, testSetup);

      expect(find(InnerComponent).length).toBe(1);
    });

    it('finds by mocked directives', () => {
      const {find} = new Rendering(fixture, {}, testSetup);

      expect(find(DirectiveToMock).length).toBe(1);
    });

    it('returns an empty query match when no matches found', () => {
      const {find} = new Rendering(fixture, {}, testSetup);

      expect(find('will-not-be-found').length).toBe(0);
    });

    it('returns a QueryMatch when a match is found', () => {
      const {find} = new Rendering(fixture, {}, testSetup);

      expect(find('inner').length).toBe(1);
      expect(find('inner').nativeElement).toBeDefined();
    });
  });

  describe('findDirective', () => {
    it('can be destructured', () => {
      const {findDirective} = new Rendering(fixture, {}, testSetup);

      expect(() => findDirective(InnerComponent)).not.toThrow();
    });

    it('finds components', () => {
      const {findDirective} = new Rendering(fixture, {}, testSetup);

      expect(findDirective(InnerComponent) instanceof InnerComponent).toBe(true);
    });

    it('finds directives', () => {
      const {findDirective} = new Rendering(fixture, {}, testSetup);

      expect(findDirective(TestDirective) instanceof TestDirective).toBe(true);
    });

    it('finds mocked directives', () => {
      const {findDirective} = new Rendering(fixture, {}, testSetup);

      expect(findDirective(DirectiveToMock) instanceof MockDirective(DirectiveToMock)).toBe(true);
    });
  });

  describe('get', () => {
    it('returns the result of TestBed.get', () => {
      const {get} = new Rendering(fixture, {}, testSetup);
      spyOn(TestBed, 'get').and.returnValue('foo');

      class QueryClass {}
      expect(get(QueryClass)).toBe('foo');
    });
  });

  describe('bindings object', () => {
    it('is returned', () => {
      const inputBindings = {};
      const {bindings} = new Rendering(fixture, inputBindings, testSetup);

      expect(bindings).toBe(inputBindings);
    });
  });

  describe('test component instance', () => {
    it('is returned', () => {
      const {instance} = new Rendering(fixture, {}, testSetup);

      expect(instance instanceof OuterComponent).toBe(true);
    });
  });
});
