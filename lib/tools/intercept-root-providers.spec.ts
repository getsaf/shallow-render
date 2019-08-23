import { Injectable, NgModule } from '@angular/core';
import { capturedProviders } from './intercept-root-providers';

describe('intrecepting injectables', () => {
  it('adds an injectable to the map based on providedIn key', () => {
    @Injectable({providedIn: 'root'})
    class ProvidedInRootOne {}

    @Injectable({providedIn: 'root'})
    class ProvidedInRootTwo {}

    @NgModule({})
    class FooModule {}

    @Injectable({providedIn: FooModule})
    class ProvidedInFoo {}

    expect(capturedProviders.get('root')).toContain(ProvidedInRootOne);
    expect(capturedProviders.get('root')).toContain(ProvidedInRootTwo);
    expect(capturedProviders.get(FooModule)).toEqual([ProvidedInFoo]);
  });

  it('does not add to the map providedIn is not used', () => {
    @Injectable()
    class NotProvidedInRoot {}

    expect(capturedProviders.get('root')).not.toContain(NotProvidedInRoot);
  });
});
