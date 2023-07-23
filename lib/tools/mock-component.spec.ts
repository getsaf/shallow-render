import { Component, Input, EventEmitter, Output } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { mockComponent } from './mock-component';

describe('mockComponent', () => {
  it('mocks the correct selector', () => {
    @Component({ selector: 'my-component' })
    class MyComponent {}

    const MyMock = mockComponent(MyComponent);
    const TestHost = testHost('<my-component></my-component>');
    const fixture = TestBed.configureTestingModule({
      declarations: [TestHost, MyMock],
    }).createComponent(TestHost);
    const instance = fixture.debugElement.query(By.css('my-component')).componentInstance;

    expect(instance).toBeInstanceOf(MyMock);
  });

  it('mocks inputs', () => {
    @Component({ selector: 'my-component' })
    class MyComponent {
      @Input() myInput!: string;
      @Input('withAlias') myAliasedInput!: string;
    }

    const TestHost = testHost('<my-component myInput="foo" withAlias="bar"></my-component>');
    const fixture = TestBed.configureTestingModule({
      declarations: [TestHost, mockComponent(MyComponent)],
    }).createComponent(TestHost);
    fixture.detectChanges();
    const instance = fixture.debugElement.query(By.css('my-component')).componentInstance;

    expect(instance.myInput).toBe('foo');
    expect(instance.myAliasedInput).toBe('bar');
  });

  it('mocks outputs', () => {
    @Component({ selector: 'my-component' })
    class MyComponent {
      @Output() myOutput = new EventEmitter();
      @Output('withAlias') myAliasedOutput = new EventEmitter();
    }

    const TestHost = testHost(
      '<my-component (myOutput)="handleEvent($event)" (withAlias)="handleEvent($event)"></my-component>',
    );
    const fixture = TestBed.configureTestingModule({
      declarations: [TestHost, mockComponent(MyComponent)],
    }).createComponent(TestHost);
    const instance = fixture.debugElement.query(By.css('my-component')).componentInstance;
    instance.myOutput.emit('foo');
    instance.myAliasedOutput.emit('bar');

    expect(fixture.componentInstance.handleEvent).toHaveBeenCalledWith('foo');
    expect(fixture.componentInstance.handleEvent).toHaveBeenCalledWith('bar');
  });

  it('mocks standalone components', () => {
    @Component({
      standalone: true,
      selector: 'my-standalone-component',
      template: '<span>{{"foo" | my-pipe}}</span>',
    })
    class MyStandaloneComponent {}

    const TestHost = testHost('<my-standalone-component>foo</my-standalone-component>');
    const fixture = TestBed.configureTestingModule({
      declarations: [TestHost],
      imports: [mockComponent(MyStandaloneComponent)],
    }).createComponent(TestHost);
    const debugElement = fixture.debugElement.query(By.directive(MyStandaloneComponent));

    expect(debugElement.nativeElement.textContent).toBe('foo');
  });

  it('renders ng-content', () => {
    @Component({ selector: 'my-component' })
    class MyComponent {}

    const TestHost = testHost('<my-component>foo</my-component>');
    const fixture = TestBed.configureTestingModule({
      declarations: [TestHost, mockComponent(MyComponent)],
    }).createComponent(TestHost);
    const element = fixture.debugElement.query(By.css('my-component'));

    expect(element.nativeElement.textContent).toBe('foo');
  });
});

const testHost = (template: string) => {
  @Component({ selector: 'test-host', template })
  class TestHostComponent {
    handleEvent = jest.fn();
  }
  return TestHostComponent;
};
