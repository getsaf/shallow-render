import { Component, EventEmitter, Output } from '@angular/core';
import {
  outputProxy,
  PickByType,
  PropertyNotAnEventEmitterError,
  PropertyNotMarkedAsOutputError,
} from './output-proxy';

describe('outputProxy', () => {
  @Component({
    selector: 'Foo',
    template: '<h1/>',
  })
  class FooComponent {
    @Output() normalOutput = new EventEmitter<string>();
    @Output() notAnEventEmitter = 'foo';
    @Output('renamed') renamedOutput = new EventEmitter<string>();
    notMarkedAsOutput = new EventEmitter<string>();
  }
  let component: FooComponent;
  let outputs: PickByType<FooComponent, EventEmitter<any>>;

  beforeEach(() => {
    component = new FooComponent();
    outputs = outputProxy(component);
  });

  it('allows access to eventEmitters that are marked as @Output', () => {
    expect(outputs.normalOutput).toBe(component.normalOutput);
  });

  it('works with renamed outputs', () => {
    expect(outputs.renamedOutput).toBe(component.renamedOutput);
  });

  it('throws an error if the property is not an EventEmitter', () => {
    try {
      String((outputs as any).notAnEventEmitter);
      fail('should have thrown an error');
    } catch (e) {
      expect(e).toBeInstanceOf(PropertyNotAnEventEmitterError);
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
