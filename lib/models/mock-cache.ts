export class MockCache {
  private readonly _cache = new Map<any, any>();

  find<TMock>(key: TMock): TMock {
    return this._cache.get(key);
  }

  add<TMock>(key: any, value: TMock): TMock {
    this._cache.set(key, value);
    return value;
  }
}
