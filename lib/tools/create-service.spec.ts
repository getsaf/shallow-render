import { Injectable, NgModule } from '@angular/core';
import { createService } from './create-service';
import { TestSetup } from '../models/test-setup';

describe('createService', () => {
  it('return a real instance of the service', () => {
    @Injectable()
    class MyService {
      foo() {
        return 'FOO';
      }
    }

    @NgModule({
      providers: [MyService],
    })
    class MyModule {}

    const setup = new TestSetup(MyService, MyModule);
    setup.dontMock.push(MyService);
    const { instance } = createService(setup);

    expect(instance).toBeInstanceOf(MyService);
    expect(instance.foo()).toBe('FOO');
  });

  it('mocks static properties', () => {
    @Injectable()
    class MyService {
      static staticFoo() {
        return 'STATIC FOO';
      }
    }

    @NgModule({
      providers: [MyService],
    })
    class MyModule {}

    const setup = new TestSetup(MyService, MyModule);
    setup.staticMocks.set(MyService, { staticFoo: () => 'MOCKED FOO' });
    createService(setup);

    expect(MyService.staticFoo()).toBe('MOCKED FOO');
  });
});
