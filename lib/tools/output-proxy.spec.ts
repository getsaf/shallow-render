import { Component, EventEmitter, output, Output } from '@angular/core';
import {
  outputProxy,
  OutputTypes,
  PickByType,
  PropertyNotAnEventEmitterOrSignalOutputError,
  PropertyNotMarkedAsOutputError,
} from './output-proxy';
import { TestBed } from '@angular/core/testing';

describe('outputProxy', () => {
  @Component({
    standalone: false,
    selector: 'Foo',
    template: '<h1>Foo</h1>',
  })
  class FooComponent {
    @Output() normalOutput = new EventEmitter<string>();
    @Output() notAnEventEmitter = 'foo';
    @Output('renamed') renamedOutput = new EventEmitter<string>();
    signalOutput = output<string>();
    notMarkedAsOutput = new EventEmitter<string>();
  }
  let component: FooComponent;
  let outputs: PickByType<FooComponent, OutputTypes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({}).compileComponents();

    const fixture = TestBed.createComponent(FooComponent);
    component = fixture.componentInstance;
    outputs = outputProxy(component);
  });

  it('allows access to eventEmitters that are marked as @Output', () => {
    expect(outputs.normalOutput).toBe(component.normalOutput);
  });

  it('works with renamed outputs', () => {
    expect(outputs.renamedOutput).toBe(component.renamedOutput);
  });

  it('works with signal outputs', () => {
    expect(outputs.signalOutput).toBe(component.signalOutput);
  });

  it('throws an error if the property is not an EventEmitter', () => {
    try {
      String((outputs as any).notAnEventEmitter);
      fail('should have thrown an error');
    } catch (e) {
      expect(e).toBeInstanceOf(PropertyNotAnEventEmitterOrSignalOutputError);
    }
  });

  it('throws an error if the property is not marked as @Output', () => {
    try {
      String(outputs.notMarkedAsOutput);
      fail('should have thrown an error');
    } catch (e) {
      expect(e).toBeInstanceOf(PropertyNotMarkedAsOutputError);
    }
  });
});
