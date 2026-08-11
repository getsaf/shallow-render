import { ɵdepsTracker } from '@angular/core';

const depsTracker = ɵdepsTracker as unknown as Record<string, unknown>;

type Clearable = { clear(): void };

const resetCache = (key: string): void => {
  const value = depsTracker[key];
  if (value == null) {
    return;
  }
  if (value instanceof Map || value instanceof Set) {
    (value as Clearable).clear();
    return;
  }
  if (value instanceof WeakMap) {
    depsTracker[key] = new WeakMap();
    return;
  }
  if (value instanceof WeakSet) {
    depsTracker[key] = new WeakSet();
  }
};

/**
 * Clears Angular DepsTracker cache
 */
export const clearAngularCache = () => {
  resetCache('ownerNgModule');
  resetCache('ngModulesWithSomeUnresolvedDecls');
  resetCache('ngModulesScopeCache');
  resetCache('standaloneComponentsScopeCache');
};
