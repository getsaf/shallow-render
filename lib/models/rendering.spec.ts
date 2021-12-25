import { Component, DebugElement, Directive, EventEmitter, Input, Output, Type, InjectionToken } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Rendering } from './rendering';
import { TestSetup } from './test-setup';
import { mockComponent } from '../tools/mock-component';
import { mockDirective } from '../tools/mock-directive';
import '../test-frameworks/shallow-matchers';

@Component({
  template: '<outer></outer>',
})
class TestHostComponent {}

@Directive({
  selector: '[directive-to-mock]',
})
class WillBeMockedDirective {}

@Directive({
  selector: '[structuralDirectiveToMock]',
})
class WillBeMockedStructuralDirective {
  @Input() structuralDirectiveToMock!: string;
  @Input('blah') blahThing!: string;
}

@Directive({
  selector: '[test-directive]',
})
class TestDirective {}

@Directive({
  selector: '[other-directive]',
})
class OtherDirective {
  @Input('other-directive') otherDirective!: string;
}

@Component({
  selector: 'outer',
  template: `
    <div class="outer">
      <inner directive-to-mock id="innerThing"></inner>
      <component-to-mock id="ctm"></component-to-mock>
      <other other-directive="one" id="one">one</other>
      <div id="two-container">
        <other other-directive="two" id="two">two</other>
      </div>
      <div *structuralDirectiveToMock="'first-one'" class="first">first foo</div>
      <div class="second-directive-container">
        <div *structuralDirectiveToMock="'second-one'" class="second">second foo</div>
      </div>
    </div>
  `,
})
class OuterComponent {
  @Output() markedAsOutput = new EventEmitter<string>();
  @Output('foo') foothing = new EventEmitter<string>();
  notMarkedAsOutput = new EventEmitter<string>();
}

@Component({
  selector: 'inner',
  template: '<span test-directive>sub</span>',
})
class InnerComponent {}

@Component({
  selector: 'component-to-mock',
  template: '<span>this will not render<span>',
})
class WillBeMockedComponent {}

@Component({
  selector: 'other',
  template: '<span>other</span>',
})
class OtherComponent {}
const MY_TOKEN = new InjectionToken<boolean>('My boolean token');

describe('Rendering', () => {
  let testSetup: TestSetup<OuterComponent>;
  let fixture: ComponentFixture<TestHostComponent>;
  let instance: OuterComponent;
  let element: DebugElement;
  let MockedComponent: Type<WillBeMockedComponent>;
  let MockedDirective: Type<WillBeMockedDirective>;
  let MockedStructuralDirective: Type<WillBeMockedStructuralDirective>;

  beforeEach(async () => {
    MockedDirective = mockDirective(WillBeMockedDirective);
    MockedStructuralDirective = mockDirective(WillBeMockedStructuralDirective);
    MockedComponent = mockComponent(WillBeMockedComponent);
    testSetup = new TestSetup(OuterComponent, class {});
    testSetup.mockCache.add(WillBeMockedDirective, MockedDirective);
    testSetup.mockCache.add(WillBeMockedComponent, MockedComponent);
    return TestBed.configureTestingModule({
      providers: [{ provide: MY_TOKEN, useValue: true }],
      declarations: [
        TestHostComponent,
        OuterComponent,
        OtherComponent,
        InnerComponent,
        TestDirective,
        OtherDirective,
        MockedComponent,
        MockedDirective,
        MockedStructuralDirective,
      ],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(TestHostComponent);
        fixture.detectChanges();
        element = fixture.debugElement.query(By.directive(OuterComponent));
        instance = element.componentInstance;
      });
  });

  describe('find', () => {
    it('can be destructured', () => {
      const { find } = new Rendering(fixture, element, instance, {}, testSetup);

      expect(() => find('some-css-selector')).not.toThrowError();
    });

    it('throws an error when used to find the test component by CSS', () => {
      const { find } = new Rendering(fixture, element, instance, {}, testSetup);

      expect(() => find('outer')).toThrow();
    });

    it('does not throw an error when used to find an inner element of the test component', () => {
      const { find } = new Rendering(fixture, element, instance, {}, testSetup);

      expect(() => find('div.outer')).not.toThrow();
    });

    it('throws an error when used to find the test component by Directive', () => {
      const { find } = new Rendering(fixture, element, instance, {}, testSetup);

      expect(() => find(OuterComponent)).toThrow();
    });

    it('can find things by CSS', () => {
      const { find } = new Rendering(fixture, element, instance, {}, testSetup);

      expect(find('inner')).toHaveFound(1);
    });

    it('can find by Component', () => {
      const { find } = new Rendering(fixture, element, instance, {}, testSetup);

      expect(find(InnerComponent)).toHaveFound(1);
    });

    it('finds by mocked Components', () => {
      const { find } = new Rendering(fixture, element, instance, {}, testSetup);

      expect(find(WillBeMockedComponent)).toHaveFound(1);
    });

    it('can find by Directive', () => {
      const { find } = new Rendering(fixture, element, instance, {}, testSetup);

      expect(find(InnerComponent)).toHaveFound(1);
    });

    it('finds by mocked directives', () => {
      const { find } = new Rendering(fixture, element, instance, {}, testSetup);

      expect(find(WillBeMockedDirective)).toHaveFound(1);
    });

    it('returns an empty query match when no matches found', () => {
      const { find } = new Rendering(fixture, element, instance, {}, testSetup);

      expect(find('will-not-be-found')).toHaveFound(0);
    });

    it('returns a QueryMatch when a match is found', () => {
      const { find } = new Rendering(fixture, element, instance, {}, testSetup);

      expect(find('inner')).toHaveFound(1);
      expect(find('inner').nativeElement).toBeDefined();
    });

    it('can search by by Component --and-- cssQuery', () => {
      const { find } = new Rendering(fixture, element, instance, {}, testSetup);

      expect(find(OtherComponent, { query: '#two' }).nativeElement.id).toBe('two');
    });

    it('can search by by Directive --and-- cssQuery', () => {
      const { find } = new Rendering(fixture, element, instance, {}, testSetup);

      expect(find(OtherDirective, { query: '#two' }).nativeElement.id).toBe('two');
    });

    it('can search by by css --and-- cssQuery', () => {
      const { find } = new Rendering(fixture, element, instance, {}, testSetup);

      expect(find('other', { query: '#two' }).nativeElement.id).toBe('two');
    });
  });

  describe('findComponent', () => {
    it('can be destructured', () => {
      const { findComponent } = new Rendering(fixture, element, instance, {}, testSetup);

      expect(() => findComponent(InnerComponent)).not.toThrow();
    });

    it('finds components', () => {
      const { findComponent } = new Rendering(fixture, element, instance, {}, testSetup);

      expect(findComponent(InnerComponent)).toBeInstanceOf(InnerComponent);
    });

    it('finds mocked components', () => {
      const { findComponent } = new Rendering(fixture, element, instance, {}, testSetup);

      expect(findComponent(WillBeMockedComponent)).toHaveFound(1);
    });

    it('finds multiple components', () => {
      const { findComponent } = new Rendering(fixture, element, instance, {}, testSetup);

      const found = findComponent(OtherComponent);
      expect(found).toHaveFound(2);
      found.forEach(i => expect(i).toBeInstanceOf(OtherComponent));
    });

    it('finds components that match a css query', () => {
      const { findComponent } = new Rendering(fixture, element, instance, {}, testSetup);

      const found = findComponent(OtherComponent, { query: '#two' });
      expect(found).toHaveFoundOne();
      expect(found[0]).toBe(fixture.debugElement.query(By.css('#two')).componentInstance);
    });
  });

  describe('findDirective', () => {
    it('can be destructured', () => {
      const { findDirective } = new Rendering(fixture, element, instance, {}, testSetup);

      expect(() => findDirective(TestDirective)).not.toThrow();
    });

    it('finds directives', () => {
      const { findDirective } = new Rendering(fixture, element, instance, {}, testSetup);

      expect(findDirective(TestDirective)).toBeInstanceOf(TestDirective);
    });

    it('finds mocked directives', () => {
      const { findDirective } = new Rendering(fixture, element, instance, {}, testSetup);

      expect(findDirective(WillBeMockedDirective)).toHaveFound(1);
    });

    it('finds multiple directives', () => {
      const { findDirective } = new Rendering(fixture, element, instance, {}, testSetup);

      const found = findDirective(OtherDirective);
      expect(found).toHaveFound(2);
      found.forEach(i => expect(i).toBeInstanceOf(OtherDirective));
    });

    it('finds directives that match a css query', () => {
      const { findDirective } = new Rendering(fixture, element, instance, {}, testSetup);

      const found = findDirective(OtherDirective, { query: '#two' });
      expect(found.otherDirective).toBe('two');
    });
  });

  describe('renderStructuralDirective', () => {
    it('renders the contents of a structural directive', () => {
      const { renderStructuralDirective, find } = new Rendering(fixture, element, instance, {}, testSetup);
      renderStructuralDirective(WillBeMockedStructuralDirective);

      expect(find('.first').nativeElement.textContent).toContain('first foo');
      expect(find('.second').nativeElement.textContent).toContain('second foo');
    });

    it('clears directive when renderContents is false', () => {
      const { renderStructuralDirective, find } = new Rendering(fixture, element, instance, {}, testSetup);
      renderStructuralDirective(WillBeMockedStructuralDirective);
      renderStructuralDirective(WillBeMockedStructuralDirective, false);

      expect(find('.first')).toHaveFound(0);
      expect(find('.second')).toHaveFound(0);
    });

    it('renders an instances of a directive from a QueryMatch', () => {
      const { renderStructuralDirective, findStructuralDirective, find } = new Rendering(
        fixture,
        element,
        instance,
        {},
        testSetup
      );
      const found = findStructuralDirective(WillBeMockedStructuralDirective, {
        query: d => d.structuralDirectiveToMock === 'second-one',
      });
      renderStructuralDirective(found);

      expect(find('.first')).toHaveFound(0);
      expect(find('.second')).toHaveFound(1);
    });

    it('renders an instances of a directive', () => {
      const { renderStructuralDirective, findStructuralDirective, find } = new Rendering(
        fixture,
        element,
        instance,
        {},
        testSetup
      );
      const found = findStructuralDirective(WillBeMockedStructuralDirective);
      renderStructuralDirective(found[0]);

      expect(find('.first')).toHaveFound(1);
      expect(find('.second')).toHaveFound(0);
    });

    it('renders multiple instances of a directive', () => {
      const { renderStructuralDirective, findStructuralDirective, find } = new Rendering(
        fixture,
        element,
        instance,
        {},
        testSetup
      );
      const found = findStructuralDirective(WillBeMockedStructuralDirective);
      renderStructuralDirective(found);

      expect(find('.first')).toHaveFound(1);
      expect(find('.second')).toHaveFound(1);
    });

    it('throws an error when attempting to render a non-mocked structural directive', () => {
      const { renderStructuralDirective, findStructuralDirective } = new Rendering(
        fixture,
        element,
        instance,
        {},
        testSetup
      );
      const found = findStructuralDirective(OtherDirective);

      // tslint:disable-next-line no-void-expression
      expect(() => renderStructuralDirective(found)).toThrowError(/You may only manually.*OtherDirective/);
    });
  });

  describe('findStructuralDirective', () => {
    it('finds structural directives when they are not rendered', () => {
      const { findStructuralDirective } = new Rendering(fixture, element, instance, {}, testSetup);

      expect(findStructuralDirective(WillBeMockedStructuralDirective)).toHaveFound(2);
    });

    it('finds structural directives by a query', () => {
      const { findStructuralDirective } = new Rendering(fixture, element, instance, {}, testSetup);

      const found = findStructuralDirective(WillBeMockedStructuralDirective, {
        query: d => d.structuralDirectiveToMock === 'second-one',
      });

      expect(found.structuralDirectiveToMock).toBe('second-one');
    });
  });

  describe('get', () => {
    it('returns the result of TestBed.inject', () => {
      jest.spyOn(TestBed, 'inject').mockReturnValue('foo');
      // tslint:disable-next-line: deprecation
      const { get } = new Rendering(fixture, element, instance, {}, testSetup);

      // tslint:disable-next-line: deprecation
      expect(get(class {})).toBe('foo');
    });
  });

  describe('inject', () => {
    it('returns the result of TestBed.inject', () => {
      jest.spyOn(TestBed, 'inject').mockReturnValue('foo');
      const { inject } = new Rendering(fixture, element, instance, {}, testSetup);

      expect(inject(class {})).toBe('foo');
    });

    it('can inject InjectionTokens', () => {
      const { inject } = new Rendering(fixture, element, instance, {}, testSetup);

      expect(inject(MY_TOKEN)).toBe(true);
    });
  });

  describe('bindings object', () => {
    it('is returned', () => {
      const inputBindings = {};
      const { bindings } = new Rendering(fixture, element, instance, inputBindings, testSetup);

      expect(bindings).toBe(inputBindings);
    });
  });

  describe('test component instance', () => {
    it('is returned', () => {
      const rendering = new Rendering(fixture, element, instance, {}, testSetup);

      expect(rendering.instance).toBe(instance);
    });
  });

  describe('outputs', () => {
    it('returns properties that are eventEmitters', () => {
      const rendering = new Rendering(fixture, element, instance, {}, testSetup);

      expect(rendering.outputs.markedAsOutput).toBeInstanceOf(EventEmitter);
    });

    it('raises an error when accessing an output that is not decorated properly', () => {
      const rendering = new Rendering(fixture, element, instance, {}, testSetup);

      expect(() => rendering.outputs.notMarkedAsOutput).toThrow();
    });
  });
});
