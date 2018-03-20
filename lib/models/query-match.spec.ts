import { createQueryMatch, NoMatchesError, MultipleMatchesError } from './query-match';

class Foo {
  constructor(public which: string) {}
}

describe('QueryMatch', () => {
  describe('multiple matches', () => {
    const matches = createQueryMatch([
      new Foo('ONE'),
      new Foo('TWO'),
    ]);

    it('throws an error when you try to access a debugElement property and there are multiple results', () => {
      expect(() => matches.which).toThrow(new MultipleMatchesError('which', 2));
    });

    it('allows mapping over results', () => {
      expect(matches.map(i => i.which))
        .toEqual(['ONE', 'TWO']);
    });

    it('allows forEach over results', () => {
      matches.forEach(i => expect(typeof i.which).toBe('string'));
    });
  });

  describe('empty results', () => {
    const emptyMatch = createQueryMatch<Foo>([]);

    it('throws an error when trying to access a property on an empty query match', () => {
      expect(() => emptyMatch.which).toThrow(new NoMatchesError('which'));
    });

    it('allows mapping over results', () => {
      expect(emptyMatch.map(i => i.which)).toEqual([]);
    });

    it('allows forEach over results', () => {
      emptyMatch.forEach(fail);
    });
  });
});
