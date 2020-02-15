import { MockCache } from './mock-cache';

describe('MockCache', () => {
  const foo = { foo: 'foo' };
  const mockFoo = { foo: 'mock foo' };

  describe('add', () => {
    it('adds an item to the cache', () => {
      const cache = new MockCache();
      cache.add(foo, mockFoo);

      expect(cache.find(foo)).toBe(mockFoo);
    });

    it('returns the mocked item', () => {
      const cache = new MockCache();

      expect(cache.add(foo, mockFoo)).toBe(mockFoo);
    });
  });

  describe('find', () => {
    it('finds an item by key', () => {
      const cache = new MockCache();
      const bar = { bar: 'bar' };
      const mockBar = { bar: 'mock bar' };
      cache.add(foo, mockFoo);
      cache.add(bar, mockBar);

      expect(cache.find(foo)).toBe(mockFoo);
      expect(cache.find(bar)).toBe(mockBar);
    });
  });
});
