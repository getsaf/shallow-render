import { Component, Input, EventEmitter, Output } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { mockComponent } from './mock-component';
import { directiveResolver } from './reflect';

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
      // tslint:disable-next-line: no-input-rename
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
      // tslint:disable-next-line: no-output-rename
      @Output('withAlias') myAliasedOutput = new EventEmitter();
    }

    const TestHost = testHost(
      '<my-component (myOutput)="handleEvent($event)" (withAlias)="handleEvent($event)"></my-component>'
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

  it('renders ng-content', () => {
    @Component({ selector: 'my-component' })
    class MyComponent {}

    const TestHost = testHost('<my-component>foo</my-component>');
    const fixture = TestBed.configureTestingModule({
      declarations: [TestHost, mockComponent(MyComponent)],
    }).createComponent(TestHost);
    const element = fixture.debugElement.query(By.css('my-component'));

    expect(element.nativeElement.innerText).toBe('foo');
  });
});

const testHost = (template: string) => {
  @Component({ selector: 'test-host', template })
  class TestHost {
    handleEvent = jasmine.createSpy();
  }
  return TestHost;
};
