import { ɵdepsTracker } from '@angular/core';

// Expose private cache variables
const depsTracker: { [K in keyof typeof ɵdepsTracker]: (typeof ɵdepsTracker)[K] } & {
  ownerNgModule: Map<unknown, unknown>;
  ngModulesWithSomeUnresolvedDecls: Set<unknown>;
  ngModulesScopeCache: Map<unknown, unknown>;
  standaloneComponentsScopeCache: Map<unknown, unknown>;
} = ɵdepsTracker as any;

/**
 * Clears Angular DepsTracker cache
 */
export const clearAngularCache = () => {
  depsTracker.ownerNgModule.clear();
  depsTracker.ngModulesWithSomeUnresolvedDecls.clear();
  depsTracker.ngModulesScopeCache.clear();
  depsTracker.standaloneComponentsScopeCache.clear();
};
