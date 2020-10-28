import { Directive, Component, Input, EventEmitter, Output } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { mockDirective, MockDirective } from './mock-directive';
import { By } from '@angular/platform-browser';
import { directiveResolver } from './reflect';

describe('mockDirective', () => {
  it('mocks the correct selector', () => {
    @Directive({ selector: '[myDirective]' })
    class MyDirective {}

    const TestHost = testHost('<div myDirective></div>');
    const MyMock = mockDirective(MyDirective);
    const fixture = TestBed.configureTestingModule({
      declarations: [TestHost, MyMock],
    }).createComponent(TestHost);
    const instance = fixture.debugElement.query(By.css('div')).injector.get(MyDirective);

    expect(instance).toBeInstanceOf(MyMock);
  });

  it('mocks inputs', () => {
    @Directive({ selector: '[myDirective]' })
    class MyDirective {
      @Input() myInput!: string;
      // tslint:disable-next-line: no-input-rename
      @Input('withAlias') myAliasedInput!: string;
    }

    const TestHost = testHost('<div myDirective myInput="foo" withAlias="bar"></div>');
    const fixture = TestBed.configureTestingModule({
      declarations: [TestHost, mockDirective(MyDirective)],
    }).createComponent(TestHost);
    fixture.detectChanges();
    const instance = fixture.debugElement.query(By.css('div')).injector.get(MyDirective);

    expect(instance.myInput).toBe('foo');
    expect(instance.myAliasedInput).toBe('bar');
  });

  it('mocks outputs', () => {
    @Directive({ selector: '[myDirective]' })
    class MyDirective {
      @Output() myOutput = new EventEmitter();
      // tslint:disable-next-line: no-output-rename
      @Output('withAlias') myAliasedOutput = new EventEmitter();
    }

    const TestHost = testHost(
      '<div myDirective (myOutput)="handleEvent($event)" (withAlias)="handleEvent($event)"></div>'
    );
    const fixture = TestBed.configureTestingModule({
      declarations: [TestHost, mockDirective(MyDirective)],
    }).createComponent(TestHost);
    const instance = fixture.debugElement.query(By.css('div')).injector.get(MyDirective);
    instance.myOutput.emit('foo');
    instance.myAliasedOutput.emit('bar');

    expect(fixture.componentInstance.handleEvent).toHaveBeenCalledWith('foo');
    expect(fixture.componentInstance.handleEvent).toHaveBeenCalledWith('bar');
  });

  it('does not render structural content by default', () => {
    @Directive({ selector: '[myDirective]' })
    class MyDirective {}

    const TestHost = testHost('<div *myDirective>foo</div>');
    const fixture = TestBed.configureTestingModule({
      declarations: [TestHost, mockDirective(MyDirective)],
    }).createComponent(TestHost);

    expect(fixture.debugElement.nativeElement.innerText).toBe('');
  });

  it('renders structural content when renderContents() is called', () => {
    @Directive({ selector: '[myDirective]' })
    class MyDirective {}

    const TestHost = testHost('<div *myDirective>foo</div>');
    const fixture = TestBed.configureTestingModule({
      declarations: [TestHost, mockDirective(MyDirective)],
    }).createComponent(TestHost);
    const instance = fixture.debugElement
      .queryAllNodes(node => !!node.injector.get(MyDirective, false))[0]
      .injector.get(MyDirective) as MockDirective;
    instance.renderContents();
    fixture.detectChanges();

    expect(fixture.debugElement.nativeElement.innerText).toBe('foo');
  });

  it('clears structural content when clearContent() is called', () => {
    @Directive({ selector: '[myDirective]' })
    class MyDirective {}

    const TestHost = testHost('<div *myDirective>foo</div>');
    const fixture = TestBed.configureTestingModule({
      declarations: [TestHost, mockDirective(MyDirective)],
    }).createComponent(TestHost);
    const instance = fixture.debugElement
      .queryAllNodes(node => !!node.injector.get(MyDirective, false))[0]
      .injector.get(MyDirective) as MockDirective;
    instance.renderContents();
    instance.clearContents();
    fixture.detectChanges();

    expect(fixture.debugElement.nativeElement.innerText).toBe('');
  });

  it('is exportedAs the same as the original directive', () => {
    @Directive({ selector: '[myDirective]', exportAs: 'myExport' })
    class MyDirective {}

    const TestHost = testHost(`
      <div myDirective #myExportInstance="myExport"></div>
      <button (onClick)="handleEvent(myExportInstance)"></button>
    `);
    const fixture = TestBed.configureTestingModule({
      declarations: [TestHost, mockDirective(MyDirective)],
    }).createComponent(TestHost);
    const instance = fixture.debugElement.query(By.css('div')).injector.get(MyDirective);
    fixture.debugElement.query(By.css('button')).triggerEventHandler('onClick', {});

    expect(fixture.componentInstance.handleEvent).toHaveBeenCalledWith(instance);
  });
});

const testHost = (template: string) => {
  @Component({ selector: 'test-host', template })
  class TestHost {
    handleEvent = jasmine.createSpy();
  }
  return TestHost;
};
