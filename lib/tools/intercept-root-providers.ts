import * as ng from '@angular/core';

/*****************************
 *  Angular does not expose access to module providers that
 *  use the `providedIn` instruction. To get around this, we
 *  can hijack the Injectable directive and scrape them out.
 *
 *  NOTE: This hijack must be in place BEFORE any angular
 *  classes have been interpreted because class decorators only
 *  fire once at class-definition.
 * ****************************/

export const capturedProviders = new Map<'root' | ng.Type<any>, ng.Type<any>[]>();

const originalInjectable = ng.Injectable;
export const interceptRootProviders = () => {
  if (originalInjectable !== ng.Injectable) {
    throw new Error('Already intrecepting root providers');
  }
  delete (ng as any).Injectable;
  Object.defineProperty(ng, 'Injectable', {
    value: (config?: any) =>
      (constructor: ng.Type<any>) => {
        const newConstructor = originalInjectable(config)(constructor) || constructor;
        if (config && config.providedIn) {
          capturedProviders.set(
            config.providedIn,
            [...(capturedProviders.get(config.providedIn) || []), newConstructor]
          );
        }
        return newConstructor;
      }
  });
};
